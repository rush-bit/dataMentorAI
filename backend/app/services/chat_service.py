import os
import json
from typing import Any

from dotenv import load_dotenv
from fastapi import HTTPException
from google import genai

load_dotenv()


def compact_context(context: dict[str, Any]) -> dict[str, Any]:
    """
    Keeps only useful, compact information for the AI tutor.
    Avoid sending full dataset rows or large chart arrays.
    """

    dataset_info = context.get("datasetInfo") or {}
    eda_report = context.get("edaReport") or {}
    target_info = context.get("targetInfo") or {}
    preprocessing_plan = context.get("preprocessingPlan") or {}
    training_result = context.get("trainingResult") or {}
    advanced_eda = context.get("advancedEDA") or {}

    compacted = {
        "dataset": {
            "filename": dataset_info.get("filename"),
            "rows": dataset_info.get("rows"),
            "columns": dataset_info.get("columns"),
            "column_names": dataset_info.get("column_names"),
            "data_types": dataset_info.get("data_types"),
            "missing_values": dataset_info.get("missing_values"),
        },
        "basic_eda": {
            "duplicate_rows": eda_report.get("duplicate_rows"),
            "numeric_columns": eda_report.get("numeric_columns"),
            "categorical_columns": eda_report.get("categorical_columns"),
            "date_columns": eda_report.get("date_columns"),
            "missing_percentage": eda_report.get("missing_percentage"),
            "numeric_summary": eda_report.get("numeric_summary"),
            "categorical_summary": eda_report.get("categorical_summary"),
        },
        "target": {
            "target_column": target_info.get("target_column"),
            "target_dtype": target_info.get("target_dtype"),
            "problem_type": target_info.get("problem_type"),
            "unique_values": target_info.get("unique_values"),
            "missing_values": target_info.get("missing_values"),
            "reason": target_info.get("reason"),
        },
        "advanced_eda": {
            "outliers": advanced_eda.get("outliers"),
            "skewness": advanced_eda.get("skewness"),
            "eda_insights": advanced_eda.get("eda_insights"),
            "feature_target_relationships": {
                "numeric_feature_correlations": (
                    advanced_eda
                    .get("feature_target_relationships", {})
                    .get("numeric_feature_correlations", {})
                ),
                "class_distribution": (
                    advanced_eda
                    .get("feature_target_relationships", {})
                    .get("class_distribution", {})
                ),
            },
        },
        "preprocessing": {
            "numeric_features": preprocessing_plan.get("numeric_features"),
            "categorical_features": preprocessing_plan.get("categorical_features"),
            "date_features": preprocessing_plan.get("date_features"),
            "suggestions": preprocessing_plan.get("suggestions"),
            "pipeline_plan": preprocessing_plan.get("pipeline_plan"),
        },
        "model_results": {
            "problem_type": training_result.get("problem_type"),
            "target_column": training_result.get("target_column"),
            "trained_models": training_result.get("trained_models"),
            "best_model": training_result.get("best_model"),
            "comparison_summary": training_result.get("comparison_summary"),
        },
    }

    return compacted


def build_tutor_prompt(question: str, context: dict[str, Any]) -> str:
    context_json = json.dumps(context, indent=2, ensure_ascii=False)

    return f"""
You are DataMentor AI, an AI tutor for beginner data science students.

Your job:
- Answer the user's question using the provided dataset context.
- Explain concepts clearly and practically.
- Prefer dataset-specific reasoning over generic answers.
- If the answer is not available from the context, say what is missing.
- Do not invent metric values, column names, or model results.
- Keep the answer concise but educational.
- Use simple examples when helpful.
- If the user asks how to improve the model, give concrete next steps.

Dataset context:
{context_json}

User question:
{question}

Answer:
"""


def generate_tutor_answer(question: str, raw_context: dict[str, Any]) -> str:
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is missing. Add GEMINI_API_KEY to backend/.env",
        )

    compacted_context = compact_context(raw_context)
    prompt = build_tutor_prompt(question, compacted_context)

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        answer = getattr(response, "text", None)

        if not answer:
            return "I could not generate an answer from the available context."

        return answer

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI tutor failed: {str(error)}"
        )