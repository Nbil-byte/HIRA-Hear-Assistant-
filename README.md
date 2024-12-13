Based on the details from the project brief and your repository branches, here's an updated README that incorporates the project's focus and structure:

---

# **HIRA Friends for the Deaf (HearAssist)**

<p align="center">
  <img src="#" alt="HIRA Logo" width="400" />
</p>

## **Project Overview**

HIRA Friends for the Deaf (HearAssist) is a real-time audio-to-text transcription system designed to empower Deaf and Hard of Hearing (D/HH) individuals in customer-facing roles, particularly in cafes. The solution promotes workplace inclusivity through advanced AI/ML integration, cloud-based deployment, and an intuitive web-based user interface.

This repository is structured into three primary branches to streamline development, deployment, and integration:

---

## **Branch Overview**

1. **`ML-Branch`**: Machine Learning Development  
   - Focuses on building and training the transcription model using TensorFlow.
   - Key outputs:
     - **Model Files**: Exported to TensorFlow.js format (`model.json` and `group1-shard1of1.bin`).
     - **Tokenizer Files**: For preprocessing (`tokenizer_vocab.json`).
   - Tools: Jupyter Notebook, TensorFlow/Keras, and Python scripts.

2. **`CC-Branch`**: Cloud Computing and Deployment  
   - Manages backend integration and cloud infrastructure.
   - Implements:
     - **Cloud Run**: For hosting the AI model and APIs.
     - **IAM Policies**: Ensuring secure, role-based access control.
     - **Cloud Storage**: Organizes audio files, processed data, and model artifacts.

3. **`WEB-Branch`**: User Interface Development  
   - Builds a web-based interface for real-time transcription.
   - Features:
     - **Frontend**: HTML, CSS, and JavaScript.
     - **Integration**: Communicates with backend APIs to display live transcription results.

---

## **Key Features**

- **Speech-to-Text Transcription**: Converts audio to text in real-time, tailored for noisy, service-oriented environments.
- **Order Categorization**: Automatically classifies transcribed text into predefined categories to streamline cafe operations.
- **Web-Based Accessibility**: Optimized for use on tablets, desktops, and other web-enabled devices.
- **Scalable Cloud Architecture**: Built for high availability and cost efficiency using Google Cloud Platform (GCP).

---

## **How to Get Started**

1. **Model Development**:  
   - Switch to the `ML-Branch` and run the `create_the_model.ipynb` notebook to preprocess, train, and export the model.

2. **Cloud Deployment**:  
   - Switch to the `CC-Branch` to configure and deploy the backend using Google Cloud Run.

3. **Frontend Testing**:  
   - Switch to the `WEB-Branch` to integrate the frontend with APIs and test the real-time transcription feature.

---

## **Live Links**

- **Demo Video**: [Watch the 10-Minute Presentation](https://www.youtube.com/watch?v=12t-i0eWm04)  
- **Dataset**: [Download Here](https://ipb.link/hiradataset)  
- **Deployed App**: [Try the Live Demo](https://frontend-dot-hira-444406.et.r.appspot.com)

---

## **Acknowledgments**

This project was developed by Team C242-PS572 as part of the Product-Based Capstone Project. We extend our gratitude to our mentors and collaborators for their invaluable guidance.

---
