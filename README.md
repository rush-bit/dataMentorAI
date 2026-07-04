# Project Architecture

## High-level architecture

```text
User
 ↓
React Frontend
 ↓
FastAPI Backend
 ↓
┌───────────────────────────────┐
│ DataMentor Core Services      │
│                               │
│ 1. Auth Service               │
│ 2. Dataset Upload Service     │
│ 3. EDA Engine                 │
│ 4. Preprocessing Engine       │
│ 5. Model Training Engine      │
│ 6. Metrics Engine             │
│ 7. AI Tutor Service           │
│ 8. Report Generator           │
└───────────────────────────────┘
 ↓
┌───────────────────────────────┐
│ Storage / Database            │
│                               │
│ Supabase Auth                 │
│ Supabase PostgreSQL           │
│ Supabase Storage              │
└───────────────────────────────┘
 ↓
Gemini API / Ollama
```

## More detailed architecture

```text
                        ┌────────────────────────┐
                         │        User            │
                         └───────────┬────────────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                         │ React + Vite Frontend  │
                         │                        │
                         │ - Dashboard            │
                         │ - Upload CSV           │
                         │ - EDA Viewer           │
                         │ - Model Trainer UI     │
                         │ - AI Tutor Chat        │
                         │ - Report Page          │
                         └───────────┬────────────┘
                                     │
                                 REST API
                                     ▼
                        ┌────────────────────────┐
                         │ FastAPI Backend        │
                         │                        │
                         │ - Upload API           │
                         │ - EDA API              │
                         │ - Preprocessing API    │
                         │ - Training API         │
                         │ - Chat API             │
                         │ - Report API           │
                         └───────────┬────────────┘
                                     │
             ┌───────────────────────┼───────────────────────┐
             ▼                       ▼                       ▼
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│ Supabase Storage   │  │ Supabase Postgres  │  │ Gemini / Ollama    │
│                    │  │                    │  │                    │
│ - CSV files        │  │ - users            │  │ - explanations     │
│ - reports          │  │ - datasets         │  │ - tutor answers    │
│ - saved models     │  │ - EDA results      │  │ - report summaries │
└────────────────────┘  │ - experiments      │  └────────────────────┘
                        │ - chat history     │
                        └────────────────────┘
```

# Main System Modules

## 1. Authentication Module
### Purpose
Allow users to register, login, and access only their own datasets.

### Features
- Sign up
- Login
- Logout
- Session management
- Protect dashboard routes

### Tech
- Supabase Auth
- React protected routes
- FastAPI token verification

## 2. Dataset Upload Module
### Purpose
Allow users to upload CSV files and start analysis.

### Features
- Upload CSV
- Validate file type
- Check file size
- Read column names
- Detect rows and columns
- Save file metadata

### Example metadata
```json
{
  "dataset_id": "ds_001",
  "user_id": "user_123",
  "filename": "housing.csv",
  "rows": 506,
  "columns": 14,
  "status": "uploaded"
}
```

## 3. Dataset Understanding Module
### Purpose
Automatically understand the dataset structure.

### Features
- Detect numeric columns
- Detect categorical columns
- Detect date columns
- Detect missing values
- Detect duplicate rows
- Detect possible target columns
- Detect problem type: regression/classification

### Example
- **Target column:** MEDV
- **Problem type:** Regression
- **Reason:** MEDV is numeric and continuous.

## 4. EDA Engine
### Purpose
Generate automated exploratory data analysis.

### Features
- Dataset shape
- Data types
- Missing value percentage
- Duplicate count
- Descriptive statistics
- Correlation matrix
- Distribution analysis
- Outlier detection
- Skewness detection
- Target-column analysis

### Charts
- Histogram
- Boxplot
- Correlation heatmap
- Scatter plot
- Bar chart for categorical variables
- Actual vs predicted later

## 5. Preprocessing Engine
### Purpose
Suggest and apply preprocessing steps.

### Features
- Missing value imputation
- Categorical encoding
- Feature scaling
- Outlier treatment
- Feature selection
- Train-test split

### Example logic
- If numeric column has missing values: suggest mean or median imputation
- If categorical column has low cardinality: suggest one-hot encoding
- If model is Linear Regression, Ridge, Logistic Regression, SVM, or KNN: suggest scaling
- If model is Tree-based: scaling is optional

## 6. Model Training Engine
### Purpose
Train ML models directly from the uploaded dataset.

### Regression models
- Linear Regression
- Ridge Regression
- Lasso Regression
- Decision Tree Regressor
- Random Forest Regressor

### Classification models
- Logistic Regression
- KNN
- Decision Tree Classifier
- Random Forest Classifier
- SVM

### Features
- Select target column
- Select features
- Select model
- Select train-test split ratio
- Train model
- Evaluate model
- Save experiment

## 7. Metrics Engine
### Purpose
Evaluate models and explain results.

### Regression metrics
- MAE
- MSE
- RMSE
- R² Score

### Classification metrics
- Accuracy
- Precision
- Recall
- F1-score
- Confusion matrix

### Example explanation
> Your R² score is 0.74. 
> This means the model explains around 74% of the variation in the target variable.
> This is decent, but there may still be non-linear patterns, outliers, missing features, or noise.

## 8. AI Tutor Module
### Purpose
Explain the dataset, EDA, preprocessing, and model results in simple language.

### User can ask
- Why is this column important?
- Why should I use StandardScaler?
- Why is Random Forest better than Linear Regression?
- What does RMSE mean?
- How can I improve this model?
- Is this dataset suitable for classification?

### Context sent to AI
- Dataset summary
- Column information
- Missing value report
- Correlation report
- Model results
- User’s selected target column
- Previous experiment details

> **Important:** Do not send the full CSV to the AI unless necessary. Send summaries, stats, and selected rows only.

## 9. Experiment Tracking Module
### Purpose
Save every model run so users can compare experiments.

### Features
- Save model name
- Save preprocessing steps
- Save train-test split
- Save metrics
- Save date/time
- Compare experiments
- Mark best model

### Example:
- **Experiment 1:** Linear Regression + StandardScaler (R²: 0.74, RMSE: 3.63)
- **Experiment 2:** Ridge Regression + StandardScaler (R²: 0.76, RMSE: 3.48)
- **Experiment 3:** Random Forest (R²: 0.84, RMSE: 2.91)

## 10. Report Generator
### Purpose
Generate a downloadable final data science report.

### Report sections
1. Dataset Overview
2. Missing Value Analysis
3. EDA Summary
4. Outlier Analysis
5. Correlation Analysis
6. Preprocessing Steps
7. Model Comparison
8. Best Model
9. Metric Explanation
10. Improvement Suggestions

### Export formats:
- Markdown first
- PDF later
