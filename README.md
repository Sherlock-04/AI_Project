# Student Outcomes & Dropout Risk Prediction

An AI and Analytics project focused on predicting student dropout risks and academic outcomes, paired with an interactive Vite + React dashboard for real-time visualization and risk assessment.

## Project Structure

- `Student Dropout_AI Project.ipynb` — Jupyter Notebook containing exploratory data analysis (EDA), feature engineering, and machine learning models for student outcome prediction.
- `student_dropout.csv` — Dataset containing demographic, socio-economic, and academic indicators.
- `StudentOutcomesDashboard.jsx` — Interactive React component visualizing student risk factors, KPIs, and outcome predictions.
- `src/main.jsx` & `index.html` — React application entry point and root template.
- `vite.config.js` — Vite build and dev server configuration.
- `package.json` — Frontend project dependencies and scripts.

## Tech Stack

- **Machine Learning / Analysis**: Python, Jupyter Notebook, Pandas, Scikit-learn
- **Frontend**: React 18, Vite, Lucide React
- **Styling**: Vanilla CSS / Inline design tokens with modern dark UI

## Getting Started

### Running the Dashboard Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000` (or the port specified in console).

### Running the ML Notebook

Open `Student Dropout_AI Project.ipynb` in VS Code or JupyterLab with your Python environment configured (e.g., pandas, scikit-learn, matplotlib, seaborn).
