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


def get_skewness_interpretation(skew_value: float) -> str:
    if skew_value > 1:
        return "Strong right skew"
    if skew_value > 0.5:
        return "Moderate right skew"
    if skew_value < -1:
        return "Strong left skew"
    if skew_value < -0.5:
        return "Moderate left skew"
    return "Approximately symmetric"


def calculate_outliers_iqr(series: pd.Series) -> dict:
    clean_series = series.dropna()

    if clean_series.empty:
        return {
            "outlier_count": 0,
            "outlier_percentage": 0.0,
            "lower_bound": None,
            "upper_bound": None,
        }

    q1 = clean_series.quantile(0.25)
    q3 = clean_series.quantile(0.75)
    iqr = q3 - q1

    if iqr == 0:
        return {
            "outlier_count": 0,
            "outlier_percentage": 0.0,
            "lower_bound": float(q1),
            "upper_bound": float(q3),
        }

    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    outliers = clean_series[
        (clean_series < lower_bound) | (clean_series > upper_bound)
    ]

    return {
        "outlier_count": int(outliers.shape[0]),
        "outlier_percentage": round(float((outliers.shape[0] / clean_series.shape[0]) * 100), 2),
        "lower_bound": round(float(lower_bound), 3),
        "upper_bound": round(float(upper_bound), 3),
    }


def generate_histogram_data(series: pd.Series, bins: int = 10) -> list[dict]:
    clean_series = series.dropna()

    if clean_series.empty:
        return []

    counts, bin_edges = np.histogram(clean_series, bins=bins)

    histogram_data = []

    for index, count in enumerate(counts):
        histogram_data.append({
            "bin_start": round(float(bin_edges[index]), 3),
            "bin_end": round(float(bin_edges[index + 1]), 3),
            "count": int(count),
            "label": f"{round(float(bin_edges[index]), 2)} - {round(float(bin_edges[index + 1]), 2)}"
        })

    return histogram_data


def generate_distribution_data(df: pd.DataFrame) -> dict:
    distributions = {}

    numeric_columns = df.select_dtypes(include=["number"]).columns.tolist()
    categorical_columns = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()

    for column in numeric_columns:
        clean_series = df[column].dropna()

        distributions[column] = {
            "type": "numeric",
            "histogram": generate_histogram_data(df[column]),
            "boxplot": {
                "min": round(float(clean_series.min()), 3) if not clean_series.empty else None,
                "q1": round(float(clean_series.quantile(0.25)), 3) if not clean_series.empty else None,
                "median": round(float(clean_series.median()), 3) if not clean_series.empty else None,
                "q3": round(float(clean_series.quantile(0.75)), 3) if not clean_series.empty else None,
                "max": round(float(clean_series.max()), 3) if not clean_series.empty else None,
            },
        }

    for column in categorical_columns:
        value_counts = (
            df[column]
            .fillna("Missing")
            .astype(str)
            .value_counts()
            .head(10)
        )

        distributions[column] = {
            "type": "categorical",
            "category_counts": [
                {
                    "category": str(category),
                    "count": int(count),
                }
                for category, count in value_counts.items()
            ],
        }

    return distributions


def generate_feature_target_relationships(
    df: pd.DataFrame,
    target_column: str | None,
    problem_type: str | None,
) -> dict:
    if not target_column or target_column not in df.columns:
        return {}

    relationships = {
        "target_column": target_column,
        "problem_type": problem_type,
        "numeric_feature_correlations": {},
        "scatter_samples": {},
        "group_summaries": {},
        "class_distribution": {},
    }

    feature_df = df.drop(columns=[target_column])
    target_series = df[target_column]

    numeric_features = feature_df.select_dtypes(include=["number"]).columns.tolist()
    categorical_features = feature_df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()

    # Regression target: numeric feature correlation + scatter samples
    if problem_type == "regression" and pd.api.types.is_numeric_dtype(target_series):
        for column in numeric_features:
            corr_value = df[column].corr(target_series)

            if pd.notna(corr_value):
                relationships["numeric_feature_correlations"][column] = round(float(corr_value), 3)

            sample_df = df[[column, target_column]].dropna().head(150)

            relationships["scatter_samples"][column] = [
                {
                    "x": make_json_safe(row[column]),
                    "y": make_json_safe(row[target_column]),
                }
                for _, row in sample_df.iterrows()
            ]

        for column in categorical_features:
            grouped = (
                df[[column, target_column]]
                .dropna()
                .groupby(column)[target_column]
                .mean()
                .sort_values(ascending=False)
                .head(10)
            )

            relationships["group_summaries"][column] = [
                {
                    "category": str(category),
                    "target_mean": round(float(value), 3),
                }
                for category, value in grouped.items()
            ]

    # Classification target: class distribution + grouped feature means
    elif problem_type == "classification":
        class_counts = (
            target_series
            .fillna("Missing")
            .astype(str)
            .value_counts()
            .head(20)
        )

        relationships["class_distribution"] = [
            {
                "class": str(label),
                "count": int(count),
            }
            for label, count in class_counts.items()
        ]

        for column in numeric_features:
            grouped = (
                df[[column, target_column]]
                .dropna()
                .groupby(target_column)[column]
                .mean()
                .head(20)
            )

            relationships["group_summaries"][column] = [
                {
                    "class": str(label),
                    "feature_mean": round(float(value), 3),
                }
                for label, value in grouped.items()
            ]

    return relationships


def generate_rule_based_eda_insights(
    correlation_matrix: dict,
    outliers: dict,
    skewness: dict,
    target_column: str | None,
    relationships: dict,
) -> list[dict]:
    insights = []

    # Correlation insights
    if target_column and relationships.get("numeric_feature_correlations"):
        sorted_corrs = sorted(
            relationships["numeric_feature_correlations"].items(),
            key=lambda item: abs(item[1]),
            reverse=True,
        )

        if sorted_corrs:
            top_feature, top_corr = sorted_corrs[0]

            direction = "positive" if top_corr > 0 else "negative"

            insights.append({
                "type": "Feature-target relationship",
                "title": f"Strongest numeric relationship with {target_column}",
                "message": (
                    f"{top_feature} has the strongest {direction} correlation "
                    f"with {target_column}: {top_corr}."
                ),
            })

    # Skewness insights
    strongly_skewed = [
        column
        for column, value in skewness.items()
        if value.get("interpretation") in ["Strong right skew", "Strong left skew"]
    ]

    if strongly_skewed:
        insights.append({
            "type": "Skewness",
            "title": "Strongly skewed columns detected",
            "message": (
                f"The following columns are strongly skewed: {', '.join(strongly_skewed[:5])}. "
                "Skewed features may need transformation or robust preprocessing."
            ),
        })

    # Outlier insights
    outlier_columns = [
        column
        for column, value in outliers.items()
        if value.get("outlier_percentage", 0) > 5
    ]

    if outlier_columns:
        insights.append({
            "type": "Outliers",
            "title": "Columns with notable outliers",
            "message": (
                f"The following columns have more than 5% possible outliers: {', '.join(outlier_columns[:5])}. "
                "Review them before using linear models."
            ),
        })

    if not insights:
        insights.append({
            "type": "General",
            "title": "No major EDA warnings detected",
            "message": "No strong skewness or high outlier percentage was detected in the basic checks.",
        })

    return insights


def generate_advanced_eda_report(
    dataset_id: str,
    target_column: str | None = None,
    problem_type: str | None = None,
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

    if target_column and target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{target_column}' does not exist"
        )

    numeric_columns = df.select_dtypes(include=["number"]).columns.tolist()

    if len(numeric_columns) >= 2:
        correlation_matrix = (
            df[numeric_columns]
            .corr(numeric_only=True)
            .round(3)
            .to_dict()
        )
    else:
        correlation_matrix = {}

    distributions = generate_distribution_data(df)

    outliers = {}

    for column in numeric_columns:
        outliers[column] = calculate_outliers_iqr(df[column])

    skewness = {}

    for column in numeric_columns:
        skew_value = df[column].skew(skipna=True)

        if pd.notna(skew_value):
            skewness[column] = {
                "skewness": round(float(skew_value), 3),
                "interpretation": get_skewness_interpretation(float(skew_value)),
            }

    relationships = generate_feature_target_relationships(
        df=df,
        target_column=target_column,
        problem_type=problem_type,
    )

    eda_insights = generate_rule_based_eda_insights(
        correlation_matrix=correlation_matrix,
        outliers=outliers,
        skewness=skewness,
        target_column=target_column,
        relationships=relationships,
    )

    response = {
        "dataset_id": dataset_id,
        "target_column": target_column,
        "problem_type": problem_type,
        "correlation_matrix": correlation_matrix,
        "distributions": distributions,
        "outliers": outliers,
        "skewness": skewness,
        "feature_target_relationships": relationships,
        "eda_insights": eda_insights,
    }

    return make_json_safe(response)