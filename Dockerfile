# ✅ Use the official Python image
FROM python:3.10

# ✅ Set the working directory
WORKDIR /app

# ✅ Copy application files
COPY . /app

# ✅ Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# ✅ Ensure Python output is shown in logs
ENV PYTHONUNBUFFERED=1

# ✅ Expose port 8080 for Cloud Run
ENV PORT=8080
EXPOSE 8080

# ✅ Start the Flask app with Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "app:app"]
