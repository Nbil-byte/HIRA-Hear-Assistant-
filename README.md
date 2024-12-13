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
#### **User Interface**
- **Platform**: Desktop interface.
- **Frontend (Google App Engine)**: A web-based frontend hosted on Google App Engine, enabling users to interact with the system.
  - **Record Audio**: Allows users to record audio directly through the interface.
  - **Attribute Name**: An input field for users to assign labels or attributes to their uploaded audio files.

---

### 2. **Backend Layer**

#### **Backend (Google Cloud Run)**
- Handles user requests such as processing uploaded or recorded audio files.

#### **Model Service (Google Cloud Run)**
- A separate containerized service that processes audio using a machine learning model implemented in TensorFlow. This service handles transcription and other audio-related tasks.

---

### 3. **Infrastructure System**

#### **Core Components**
- **TensorFlow**: Framework used to develop and run AI/ML models for audio transcription and processing.
- **Cloud IAM (Identity and Access Management)**: Ensures secure and controlled access to cloud services and resources. This includes managing access to the storage buckets and AI models.

#### **Bucket-HIRA (Google Cloud Storage)**
Organized into the following folders for efficient management:
- **Uploads**: Stores general files uploaded by users.
- **Audio-uploads**: Dedicated to storing audio files recorded or uploaded via the frontend.
- **Transcribed-audio**: Contains the transcription results from the ML model.
- **Model-HIRA**: Likely stores the AI model and related resources.

---

## Data Flow

1. **User Interaction**: The user accesses the frontend via their desktop.
2. **Audio Recording/Uploading**: The user records or uploads an audio file through the frontend, which is sent to the backend (Google Cloud Run).
3. **Storage**: The backend validates the input and stores the audio in the "Audio-uploads" folder within Bucket-HIRA (Google Cloud Storage).
4. **Speech-to-Text API**: The audio file is transcribed using the Speech-to-Text API, and the results are stored in the "Transcribed-audio" folder.
5. **ML Model Processing**: The transcription result is further processed by the ML model hosted on Google Cloud Run using TensorFlow.
6. **Frontend Delivery**: The processed transcription is sent back to the frontend for display to the user.
7. **Secure Access**: Cloud IAM ensures secure interactions between all components, including access to storage and the ML model.

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
