import numpy as np
import pandas as pd
from fastapi import HTTPException

from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

from sklearn.linear_model import (
    LinearRegression,
    Ridge,
    Lasso,
    LogisticRegression,
)
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
)

from app.utils.file_utils import get_dataset_file_path
from app.services.preprocessing_pipeline import build_preprocessor


REGRESSION_MODELS = {
    "linear_regression": {
        "display_name": "Linear Regression",
        "description": "A simple baseline model that fits a linear relationship between features and target.",
        "estimator": LinearRegression,
    },
    "ridge_regression": {
        "display_name": "Ridge Regression",
        "description": "A regularized linear model that reduces overfitting using L2 regularization.",
        "estimator": Ridge,
    },
    "lasso_regression": {
        "display_name": "Lasso Regression",
        "description": "A regularized linear model that can shrink less useful feature coefficients toward zero.",
        "estimator": Lasso,
    },
    "random_forest_regressor": {
        "display_name": "Random Forest Regressor",
        "description": "An ensemble of decision trees that can capture non-linear patterns.",
        "estimator": RandomForestRegressor,
    },
}


CLASSIFICATION_MODELS = {
    "logistic_regression": {
        "display_name": "Logistic Regression",
        "description": "A strong linear baseline model for classification problems.",
        "estimator": LogisticRegression,
    },
    "decision_tree_classifier": {
        "display_name": "Decision Tree Classifier",
        "description": "A tree-based model that learns decision rules from the data.",
        "estimator": DecisionTreeClassifier,
    },
    "random_forest_classifier": {
        "display_name": "Random Forest Classifier",
        "description": "An ensemble classifier that combines multiple decision trees.",
        "estimator": RandomForestClassifier,
    },
    "svm_classifier": {
        "display_name": "SVM Classifier",
        "description": "A margin-based classifier that works well on scaled numeric data.",
        "estimator": SVC,
    },
    "knn_classifier": {
        "display_name": "KNN Classifier",
        "description": "A distance-based classifier that predicts using nearby examples.",
        "estimator": KNeighborsClassifier,
    },
}


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


def get_model_suggestions(dataset_id: str, target_column: str, problem_type: str) -> dict:
    file_path = get_dataset_file_path(dataset_id)

    try:
        df = pd.read_csv(file_path)
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {str(error)}"
        )

    if target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{target_column}' does not exist"
        )

    if problem_type == "regression":
        model_source = REGRESSION_MODELS
    elif problem_type == "classification":
        model_source = CLASSIFICATION_MODELS
    else:
        raise HTTPException(
            status_code=400,
            detail="Problem type must be either regression or classification"
        )

    suggested_models = []

    for model_key, model_info in model_source.items():
        suggested_models.append({
            "model_key": model_key,
            "display_name": model_info["display_name"],
            "description": model_info["description"],
        })

    return {
        "dataset_id": dataset_id,
        "target_column": target_column,
        "problem_type": problem_type,
        "suggested_models": suggested_models,
    }


def create_estimator(model_key: str, problem_type: str):
    if problem_type == "regression":
        if model_key == "linear_regression":
            return LinearRegression()

        if model_key == "ridge_regression":
            return Ridge(alpha=1.0)

        if model_key == "lasso_regression":
            return Lasso(alpha=0.01, max_iter=10000)

        if model_key == "random_forest_regressor":
            return RandomForestRegressor(
                n_estimators=100,
                random_state=42,
            )

    if problem_type == "classification":
        if model_key == "logistic_regression":
            return LogisticRegression(max_iter=1000)

        if model_key == "decision_tree_classifier":
            return DecisionTreeClassifier(random_state=42)

        if model_key == "random_forest_classifier":
            return RandomForestClassifier(
                n_estimators=100,
                random_state=42,
            )

        if model_key == "svm_classifier":
            return SVC(probability=True)

        if model_key == "knn_classifier":
            return KNeighborsClassifier(n_neighbors=5)

    raise HTTPException(
        status_code=400,
        detail=f"Unsupported model '{model_key}' for {problem_type}"
    )


def get_model_display_name(model_key: str, problem_type: str) -> str:
    if problem_type == "regression":
        return REGRESSION_MODELS[model_key]["display_name"]

    return CLASSIFICATION_MODELS[model_key]["display_name"]


def get_feature_groups(df: pd.DataFrame, target_column: str):
    feature_df = df.drop(columns=[target_column])

    date_features = detect_date_columns(feature_df)

    numeric_features = feature_df.select_dtypes(include=["number"]).columns.tolist()

    categorical_features = feature_df.select_dtypes(
        include=["object", "category", "bool"]
    ).columns.tolist()

    categorical_features = [
        column for column in categorical_features
        if column not in date_features
    ]

    usable_features = numeric_features + categorical_features

    return numeric_features, categorical_features, date_features, usable_features


def get_stratify_target(y: pd.Series):
    class_counts = y.value_counts(dropna=False)

    if len(class_counts) < 2:
        return None

    if class_counts.min() < 2:
        return None

    return y


def calculate_regression_metrics(y_test, y_pred) -> dict:
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)

    return {
        "mae": round(float(mean_absolute_error(y_test, y_pred)), 4),
        "mse": round(float(mse), 4),
        "rmse": round(float(rmse), 4),
        "r2_score": round(float(r2_score(y_test, y_pred)), 4),
    }


def calculate_classification_metrics(y_test, y_pred) -> dict:
    return {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision_weighted": round(
            float(precision_score(y_test, y_pred, average="weighted", zero_division=0)),
            4,
        ),
        "recall_weighted": round(
            float(recall_score(y_test, y_pred, average="weighted", zero_division=0)),
            4,
        ),
        "f1_weighted": round(
            float(f1_score(y_test, y_pred, average="weighted", zero_division=0)),
            4,
        ),
    }

def explain_regression_metrics(metrics: dict) -> list[dict]:
    r2 = metrics.get("r2_score")
    rmse = metrics.get("rmse")
    mae = metrics.get("mae")
    mse = metrics.get("mse")

    explanations = []

    explanations.append({
        "metric": "MAE",
        "value": mae,
        "meaning": "Mean Absolute Error measures the average absolute prediction error.",
        "interpretation": (
            f"On average, the model prediction is off by about {mae} target units. "
            "Lower MAE is better."
        ),
    })

    explanations.append({
        "metric": "MSE",
        "value": mse,
        "meaning": "Mean Squared Error squares each prediction error before averaging.",
        "interpretation": (
            "MSE penalizes large errors more strongly than MAE. "
            "Lower MSE is better."
        ),
    })

    explanations.append({
        "metric": "RMSE",
        "value": rmse,
        "meaning": "Root Mean Squared Error is the square root of MSE.",
        "interpretation": (
            f"RMSE is about {rmse} target units. Because it penalizes large errors, "
            "it is useful for spotting models that make occasional big mistakes."
        ),
    })

    if r2 is not None:
        if r2 >= 0.8:
            quality = "strong"
        elif r2 >= 0.6:
            quality = "decent"
        elif r2 >= 0.3:
            quality = "weak to moderate"
        else:
            quality = "weak"

        explanations.append({
            "metric": "R² Score",
            "value": r2,
            "meaning": "R² measures how much variation in the target is explained by the model.",
            "interpretation": (
                f"Your R² score is {r2}. This is a {quality} result. "
                f"Roughly speaking, the model explains about {round(r2 * 100, 2)}% "
                "of the target variation when R² is positive."
            ),
        })

    return explanations


def explain_classification_metrics(metrics: dict) -> list[dict]:
    accuracy = metrics.get("accuracy")
    precision = metrics.get("precision_weighted")
    recall = metrics.get("recall_weighted")
    f1 = metrics.get("f1_weighted")
    roc_auc = metrics.get("roc_auc")

    explanations = []

    explanations.append({
        "metric": "Accuracy",
        "value": accuracy,
        "meaning": "Accuracy measures the fraction of correct predictions.",
        "interpretation": (
            f"The model predicted correctly for about {round(accuracy * 100, 2)}% "
            "of test samples. Accuracy is useful, but can be misleading when classes are imbalanced."
        ) if accuracy is not None else "Accuracy was not available.",
    })

    explanations.append({
        "metric": "Precision",
        "value": precision,
        "meaning": "Precision measures how many predicted positives were actually correct.",
        "interpretation": (
            "Higher precision means fewer false positives. Weighted precision averages this across classes."
        ),
    })

    explanations.append({
        "metric": "Recall",
        "value": recall,
        "meaning": "Recall measures how many actual positives were found by the model.",
        "interpretation": (
            "Higher recall means fewer false negatives. Weighted recall averages this across classes."
        ),
    })

    explanations.append({
        "metric": "F1-score",
        "value": f1,
        "meaning": "F1-score balances precision and recall.",
        "interpretation": (
            "F1 is useful when you care about both false positives and false negatives. "
            "Higher F1 is better."
        ),
    })

    if roc_auc is not None:
        explanations.append({
            "metric": "ROC-AUC",
            "value": roc_auc,
            "meaning": "ROC-AUC measures how well the model separates classes across thresholds.",
            "interpretation": (
                f"ROC-AUC is {roc_auc}. Values closer to 1.0 indicate stronger class separation."
            ),
        })

    return explanations


def build_regression_artifacts(y_test, y_pred) -> dict:
    actual_values = pd.Series(y_test).reset_index(drop=True)
    predicted_values = pd.Series(y_pred).reset_index(drop=True)
    residuals = actual_values - predicted_values

    sample_size = min(200, len(actual_values))

    actual_vs_predicted = []

    for index in range(sample_size):
        actual_vs_predicted.append({
            "index": int(index),
            "actual": round(float(actual_values.iloc[index]), 4),
            "predicted": round(float(predicted_values.iloc[index]), 4),
            "residual": round(float(residuals.iloc[index]), 4),
        })

    residual_summary = {
        "mean_residual": round(float(residuals.mean()), 4),
        "min_residual": round(float(residuals.min()), 4),
        "max_residual": round(float(residuals.max()), 4),
        "std_residual": round(float(residuals.std()), 4),
    }

    return {
        "actual_vs_predicted": actual_vs_predicted,
        "residuals": actual_vs_predicted,
        "residual_summary": residual_summary,
    }


def calculate_roc_auc_if_possible(model_pipeline, X_test, y_test) -> float | None:
    try:
        model = model_pipeline.named_steps["model"]

        if not hasattr(model_pipeline, "predict_proba"):
            return None

        y_score = model_pipeline.predict_proba(X_test)

        unique_classes = pd.Series(y_test).nunique(dropna=True)

        if unique_classes == 2:
            return round(float(roc_auc_score(y_test, y_score[:, 1])), 4)

        return round(
            float(
                roc_auc_score(
                    y_test,
                    y_score,
                    multi_class="ovr",
                    average="weighted",
                )
            ),
            4,
        )

    except Exception:
        return None


def build_classification_artifacts(y_test, y_pred) -> dict:
    labels = sorted(pd.Series(y_test).dropna().unique().tolist())
    matrix = confusion_matrix(y_test, y_pred, labels=labels)

    confusion_rows = []

    for row_index, actual_label in enumerate(labels):
        row = {
            "actual": make_json_safe(actual_label),
            "values": [],
        }

        for col_index, predicted_label in enumerate(labels):
            row["values"].append({
                "predicted": make_json_safe(predicted_label),
                "count": int(matrix[row_index][col_index]),
            })

        confusion_rows.append(row)

    return {
        "labels": [make_json_safe(label) for label in labels],
        "confusion_matrix": confusion_rows,
    }

def choose_best_model(trained_models: list[dict], problem_type: str) -> dict | None:
    successful_models = [
        model for model in trained_models
        if model.get("status") == "success"
    ]

    if not successful_models:
        return None

    if problem_type == "regression":
        return sorted(
            successful_models,
            key=lambda model: (
                model["metrics"].get("r2_score", -999999),
                -model["metrics"].get("rmse", 999999),
            ),
            reverse=True,
        )[0]

    return sorted(
        successful_models,
        key=lambda model: (
            model["metrics"].get("f1_weighted", -999999),
            model["metrics"].get("accuracy", -999999),
        ),
        reverse=True,
    )[0]


def generate_comparison_summary(best_model: dict | None, problem_type: str) -> str:
    if not best_model:
        return "No model was trained successfully."

    model_name = best_model["display_name"]

    if problem_type == "regression":
        metrics = best_model["metrics"]

        return (
            f"Best model: {model_name}. "
            f"Reason: it achieved the highest R² score ({metrics.get('r2_score')}) "
            f"with RMSE {metrics.get('rmse')}. A higher R² means the model explains "
            "more variation in the target, while a lower RMSE means smaller prediction error."
        )

    metrics = best_model["metrics"]

    return (
        f"Best model: {model_name}. "
        f"Reason: it achieved the strongest weighted F1-score ({metrics.get('f1_weighted')}) "
        f"with accuracy {metrics.get('accuracy')}. Weighted F1 is useful because it balances "
        "precision and recall across classes."
    )


def train_selected_models(
    dataset_id: str,
    target_column: str,
    problem_type: str,
    selected_models: list[str],
    test_size: float,
    random_state: int,
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
            detail="Problem type must be either regression or classification"
        )

    if not selected_models:
        raise HTTPException(
            status_code=400,
            detail="Select at least one model to train"
        )

    if test_size <= 0 or test_size >= 0.8:
        raise HTTPException(
            status_code=400,
            detail="test_size must be greater than 0 and less than 0.8"
        )

    # Drop rows where target is missing.
    df = df.dropna(subset=[target_column])

    if df.shape[0] < 10:
        raise HTTPException(
            status_code=400,
            detail="Dataset must have at least 10 rows after removing missing target values"
        )

    y = df[target_column]
    X = df.drop(columns=[target_column])

    numeric_features, categorical_features, date_features, usable_features = get_feature_groups(
        df=df,
        target_column=target_column,
    )

    if not usable_features:
        raise HTTPException(
            status_code=400,
            detail="No usable numeric or categorical feature columns found"
        )

    X = X[usable_features]

    if problem_type == "classification" and y.nunique(dropna=True) < 2:
        raise HTTPException(
            status_code=400,
            detail="Classification target must have at least two classes"
        )

    if problem_type == "regression" and not pd.api.types.is_numeric_dtype(y):
        raise HTTPException(
            status_code=400,
            detail="Regression target must be numeric"
        )

    stratify_target = None

    if problem_type == "classification":
        stratify_target = get_stratify_target(y)

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=test_size,
            random_state=random_state,
            stratify=stratify_target,
        )
    except Exception:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=test_size,
            random_state=random_state,
            stratify=None,
        )

    trained_models = []

    for model_key in selected_models:
        try:
            estimator = create_estimator(model_key, problem_type)

            preprocessor = build_preprocessor(
                numeric_features=numeric_features,
                categorical_features=categorical_features,
            )

            model_pipeline = Pipeline(
                steps=[
                    ("preprocessor", preprocessor),
                    ("model", estimator),
                ]
            )

            model_pipeline.fit(X_train, y_train)
            y_pred = model_pipeline.predict(X_test)

            if problem_type == "regression":
                metrics = calculate_regression_metrics(y_test, y_pred)
                metric_explanations = explain_regression_metrics(metrics)
                evaluation_artifacts = build_regression_artifacts(y_test, y_pred)

            else:
                metrics = calculate_classification_metrics(y_test, y_pred)

                roc_auc = calculate_roc_auc_if_possible(
                    model_pipeline=model_pipeline,
                    X_test=X_test,
                    y_test=y_test,
                )

                metrics["roc_auc"] = roc_auc

                metric_explanations = explain_classification_metrics(metrics)
                evaluation_artifacts = build_classification_artifacts(y_test, y_pred)

            trained_models.append({
                "model_key": model_key,
                "display_name": get_model_display_name(model_key, problem_type),
                "status": "success",
                "metrics": metrics,
                "metric_explanations": metric_explanations,
                "evaluation_artifacts": evaluation_artifacts,
                "training_details": {
                    "train_rows": int(X_train.shape[0]),
                    "test_rows": int(X_test.shape[0]),
                    "test_size": float(test_size),
                    "numeric_features": numeric_features,
                    "categorical_features": categorical_features,
                    "dropped_date_features": date_features,
                },
            })

        except Exception as error:
            trained_models.append({
                "model_key": model_key,
                "display_name": model_key,
                "status": "failed",
                "error": str(error),
                "metrics": {},
            })

    best_model = choose_best_model(trained_models, problem_type)
    comparison_summary = generate_comparison_summary(best_model, problem_type)

    response = {
        "dataset_id": dataset_id,
        "target_column": target_column,
        "problem_type": problem_type,
        "trained_models": trained_models,
        "best_model": best_model,
        "comparison_summary": comparison_summary,
    }

    return make_json_safe(response)