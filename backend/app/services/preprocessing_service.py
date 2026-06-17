import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.utils.file_utils import get_dataset_file_path


def make_json_safe(value):
    if isinstance(value, dict):
        return {str(key): make_json_safe(val) for key, val in value.items()}

    if isinstance(value, list):
        return [make_json_safe(item) for item in value]

    if isinstance(value, tuple):
        return [make_json_safe(item) for item in value]

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        if np.isnan(value):
            return None
        return float(value)

    if isinstance(value, np.ndarray):
        return value.tolist()

    if pd.isna(value):
        return None

    return value


def detect_date_columns(df: pd.DataFrame) -> list[str]:
    date_columns = []

    for column in df.columns:
        if df[column].dtype == "object":
            parsed_dates = pd.to_datetime(df[column], errors="coerce")
            valid_ratio = parsed_dates.notna().mean()

            if valid_ratio >= 0.8:
                date_columns.append(column)

    return date_columns


def count_outliers_iqr(series: pd.Series) -> int:
    clean_series = series.dropna()

    if clean_series.empty:
        return 0

    q1 = clean_series.quantile(0.25)
    q3 = clean_series.quantile(0.75)
    iqr = q3 - q1

    if iqr == 0:
        return 0

    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    return int(((clean_series < lower_bound) | (clean_series > upper_bound)).sum())


def get_missing_value_suggestion(column: str, series: pd.Series) -> dict | None:
    missing_count = int(series.isnull().sum())

    if missing_count == 0:
        return None

    missing_percentage = round(float(series.isnull().mean() * 100), 2)

    if pd.api.types.is_numeric_dtype(series):
        outlier_count = count_outliers_iqr(series)
        skewness = series.skew(skipna=True)

        if outlier_count > 0 or abs(skewness) > 1:
            method = "median imputation"
            reason = (
                f"{column} is numeric and may contain outliers or skewed values. "
                "Median is safer than mean because it is less affected by extreme values."
            )
        else:
            method = "mean imputation"
            reason = (
                f"{column} is numeric and does not show strong skewness or many outliers. "
                "Mean imputation is acceptable for this column."
            )

        return {
            "category": "Missing Value Handling",
            "column": column,
            "issue": f"{missing_count} missing values ({missing_percentage}%)",
            "recommendation": method,
            "reason": reason,
            "severity": "warning" if missing_percentage > 20 else "info",
        }

    method = "mode imputation"
    reason = (
        f"{column} is categorical/text-based. Mode imputation replaces missing values "
        "with the most frequent category."
    )

    return {
        "category": "Missing Value Handling",
        "column": column,
        "issue": f"{missing_count} missing values ({missing_percentage}%)",
        "recommendation": method,
        "reason": reason,
        "severity": "warning" if missing_percentage > 20 else "info",
    }


def get_encoding_suggestion(column: str, series: pd.Series, total_rows: int) -> dict:
    unique_count = int(series.nunique(dropna=True))
    unique_ratio = round(float(unique_count / total_rows), 3) if total_rows > 0 else 0

    if unique_count <= 1:
        return {
            "category": "Encoding",
            "column": column,
            "issue": "Column has only one unique value",
            "recommendation": "Drop this feature",
            "reason": "A feature with only one unique value does not help the model learn patterns.",
            "severity": "warning",
        }

    if unique_count <= 20:
        return {
            "category": "Encoding",
            "column": column,
            "issue": f"{unique_count} unique categories",
            "recommendation": "OneHotEncoder",
            "reason": (
                "This column has a manageable number of categories. One-hot encoding "
                "can convert it into numeric binary columns for ML models."
            ),
            "severity": "info",
        }

    if unique_ratio > 0.5:
        return {
            "category": "Encoding",
            "column": column,
            "issue": f"High cardinality: {unique_count} unique values",
            "recommendation": "Review, drop, or use advanced encoding later",
            "reason": (
                "This column has too many unique values. One-hot encoding may create too many columns "
                "and make the model inefficient."
            ),
            "severity": "warning",
        }

    return {
        "category": "Encoding",
        "column": column,
        "issue": f"{unique_count} unique categories",
        "recommendation": "OneHotEncoder with caution",
        "reason": (
            "This column has many categories but may still be usable. For the MVP, one-hot encoding "
            "can be used, but advanced encoding can be added later."
        ),
        "severity": "info",
    }


def get_outlier_suggestion(column: str, series: pd.Series, total_rows: int) -> dict | None:
    if not pd.api.types.is_numeric_dtype(series):
        return None

    outlier_count = count_outliers_iqr(series)

    if outlier_count == 0:
        return None

    outlier_percentage = round(float((outlier_count / total_rows) * 100), 2)

    return {
        "category": "Outlier Treatment",
        "column": column,
        "issue": f"{outlier_count} possible outliers ({outlier_percentage}%) using IQR method",
        "recommendation": "Do not remove automatically; review first",
        "reason": (
            "Outliers can be real signals or data errors. For linear models, capping or transformation "
            "may help. For tree-based models, outliers are usually less harmful."
        ),
        "severity": "warning" if outlier_percentage > 5 else "info",
    }


def get_feature_selection_suggestions(
    df: pd.DataFrame,
    target_column: str,
    numeric_features: list[str],
    categorical_features: list[str],
) -> list[dict]:
    suggestions = []
    feature_df = df.drop(columns=[target_column])

    for column in feature_df.columns:
        unique_count = int(feature_df[column].nunique(dropna=True))
        missing_percentage = round(float(feature_df[column].isnull().mean() * 100), 2)

        if unique_count <= 1:
            suggestions.append({
                "category": "Feature Selection",
                "column": column,
                "issue": "Constant or near-constant feature",
                "recommendation": "Drop this feature",
                "reason": "A feature with only one unique value cannot help the model learn useful patterns.",
                "severity": "warning",
            })

        if missing_percentage > 50:
            suggestions.append({
                "category": "Feature Selection",
                "column": column,
                "issue": f"Very high missing percentage: {missing_percentage}%",
                "recommendation": "Consider dropping this feature",
                "reason": "A feature with more than 50% missing values may add noise unless it is very important.",
                "severity": "warning",
            })

    if len(numeric_features) >= 2:
        corr_matrix = df[numeric_features].corr(numeric_only=True).abs()

        checked_pairs = set()

        for col1 in corr_matrix.columns:
            for col2 in corr_matrix.columns:
                if col1 == col2:
                    continue

                pair_key = tuple(sorted([col1, col2]))

                if pair_key in checked_pairs:
                    continue

                checked_pairs.add(pair_key)

                corr_value = corr_matrix.loc[col1, col2]

                if pd.notna(corr_value) and corr_value >= 0.9:
                    suggestions.append({
                        "category": "Feature Selection",
                        "column": f"{col1}, {col2}",
                        "issue": f"High correlation between features: {round(float(corr_value), 3)}",
                        "recommendation": "Consider keeping only one of these features",
                        "reason": (
                            "Highly correlated features can add redundant information, especially for linear models."
                        ),
                        "severity": "info",
                    })

    target_series = df[target_column]

    if pd.api.types.is_numeric_dtype(target_series) and len(numeric_features) > 0:
        correlations = {}

        for column in numeric_features:
            corr_value = df[column].corr(target_series)

            if pd.notna(corr_value):
                correlations[column] = abs(float(corr_value))

        if correlations:
            top_features = sorted(
                correlations.items(),
                key=lambda item: item[1],
                reverse=True
            )[:5]

            suggestions.append({
                "category": "Feature Selection",
                "column": "Top numeric features",
                "issue": "Numeric correlation with target",
                "recommendation": ", ".join([feature for feature, _ in top_features]),
                "reason": (
                    "These numeric features have the strongest linear relationship with the target. "
                    "They may be useful starting features, but correlation does not prove causation."
                ),
                "severity": "info",
                "details": {
                    feature: round(score, 3)
                    for feature, score in top_features
                },
            })

    return suggestions


def generate_preprocessing_suggestions(
    dataset_id: str,
    target_column: str,
    problem_type: str,
) -> dict:
    file_path = get_dataset_file_path(dataset_id)

    try:
        df = pd.read_csv(file_path)
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {str(error)}"
        )

    if df.empty:
        raise HTTPException(status_code=400, detail="Dataset is empty")

    if target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{target_column}' does not exist"
        )

    if problem_type not in ["regression", "classification"]:
        raise HTTPException(
            status_code=400,
            detail="Problem type must be either 'regression' or 'classification'"
        )

    feature_df = df.drop(columns=[target_column])
    total_rows = int(df.shape[0])

    date_features = detect_date_columns(feature_df)

    numeric_features = feature_df.select_dtypes(include=["number"]).columns.tolist()

    categorical_features = feature_df.select_dtypes(
        include=["object", "category", "bool"]
    ).columns.tolist()

    categorical_features = [
        column for column in categorical_features
        if column not in date_features
    ]

    suggestions = []

    # 1. Missing value suggestions
    for column in feature_df.columns:
        suggestion = get_missing_value_suggestion(column, feature_df[column])

        if suggestion:
            suggestions.append(suggestion)

    # 2. Encoding suggestions
    for column in categorical_features:
        suggestions.append(
            get_encoding_suggestion(column, feature_df[column], total_rows)
        )

    # 3. Scaling suggestion
    if numeric_features:
        suggestions.append({
            "category": "Scaling",
            "column": "Numeric features",
            "issue": "Numeric features may have different ranges",
            "recommendation": "StandardScaler for linear/distance-based models",
            "reason": (
                "Linear Regression, Ridge, Logistic Regression, SVM, and KNN can be affected by feature scale. "
                "StandardScaler makes numeric columns comparable by centering and scaling them."
            ),
            "severity": "info",
            "affected_columns": numeric_features,
        })

    # 4. Train-test split suggestion
    if problem_type == "classification":
        split_reason = (
            "For classification, use an 80/20 train-test split. If class distribution allows, "
            "use stratified splitting so train and test sets keep similar class proportions."
        )
    else:
        split_reason = (
            "For regression, use an 80/20 train-test split to evaluate how well the model predicts unseen data."
        )

    suggestions.append({
        "category": "Train-Test Split",
        "column": target_column,
        "issue": "Need separate training and testing data",
        "recommendation": "Use 80% training data and 20% testing data",
        "reason": split_reason,
        "severity": "info",
    })

    # 5. Outlier treatment suggestions
    for column in numeric_features:
        suggestion = get_outlier_suggestion(column, feature_df[column], total_rows)

        if suggestion:
            suggestions.append(suggestion)

    # 6. Date column suggestions
    for column in date_features:
        suggestions.append({
            "category": "Date Feature Handling",
            "column": column,
            "issue": "Date-like column detected",
            "recommendation": "Extract useful date parts later or drop for MVP",
            "reason": (
                "Raw date strings cannot be used directly by most scikit-learn models. "
                "Later, we can extract year, month, day, weekday, or time-based features."
            ),
            "severity": "info",
        })

    # 7. Feature selection suggestions
    suggestions.extend(
        get_feature_selection_suggestions(
            df=df,
            target_column=target_column,
            numeric_features=numeric_features,
            categorical_features=categorical_features,
        )
    )

    pipeline_plan = {
        "numeric_pipeline": {
            "columns": numeric_features,
            "steps": [
                {
                    "name": "imputer",
                    "method": "SimpleImputer(strategy='median')",
                    "reason": "Median imputation is robust for numeric features with outliers.",
                },
                {
                    "name": "scaler",
                    "method": "StandardScaler()",
                    "reason": "Standardizes numeric features for linear and distance-based models.",
                },
            ],
        },
        "categorical_pipeline": {
            "columns": categorical_features,
            "steps": [
                {
                    "name": "imputer",
                    "method": "SimpleImputer(strategy='most_frequent')",
                    "reason": "Fills missing categorical values using the most common category.",
                },
                {
                    "name": "encoder",
                    "method": "OneHotEncoder(handle_unknown='ignore')",
                    "reason": "Converts categories into numeric columns and safely handles unseen categories.",
                },
            ],
        },
        "date_features": {
            "columns": date_features,
            "current_action": "drop_for_mvp",
            "future_action": "extract year/month/day/weekday features",
        },
        "train_test_split": {
            "test_size": 0.2,
            "random_state": 42,
            "stratify": problem_type == "classification",
        },
    }

    response = {
        "dataset_id": dataset_id,
        "target_column": target_column,
        "problem_type": problem_type,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "date_features": date_features,
        "suggestions": suggestions,
        "pipeline_plan": pipeline_plan,
    }

    return make_json_safe(response)