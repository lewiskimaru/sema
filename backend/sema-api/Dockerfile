# Dockerfile for Sema Translation API on HuggingFace Spaces
# Multi-stage build to handle model downloading with proper permissions

# Stage 1: Download models as root
FROM python:3.10-slim AS model-builder

# Install huggingface_hub for downloading models
RUN pip install huggingface_hub

# Download models from sematech/sema-utils
RUN python -c "\
from huggingface_hub import hf_hub_download; \
hf_hub_download('sematech/sema-utils', 'spm.model'); \
hf_hub_download('sematech/sema-utils', 'lid218e.bin'); \
hf_hub_download('sematech/sema-utils', 'translation_models/sematrans-3.3B/model.bin'); \
hf_hub_download('sematech/sema-utils', 'translation_models/sematrans-3.3B/config.json'); \
hf_hub_download('sematech/sema-utils', 'translation_models/sematrans-3.3B/shared_vocabulary.txt')"

# Stage 2: Build the application
FROM python:3.10-slim

# Set up a new user named "user" with user ID 1000
RUN useradd -m -u 1000 user

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# Set environment variables for HuggingFace
ENV HF_HUB_OFFLINE=1
ENV TRANSFORMERS_NO_ADVISORY_WARNINGS=1

# Copy the requirements file and install dependencies
COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy the downloaded models from the builder stage
COPY --chown=user --from=model-builder /root/.cache/huggingface $HOME/.cache/huggingface

# Copy the application code
COPY --chown=user ./app app

# Expose port 7860 (HuggingFace Spaces standard)
EXPOSE 7860

# Tell uvicorn to run on port 7860, which is the standard for HF Spaces
# Use 0.0.0.0 to make it accessible from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
