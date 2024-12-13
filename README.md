# HIRA (HearAssist for Real-time Accessibility)

HIRA (HearAssist for Real-time Accessibility) is a mobile app that helps Deaf and Hard of Hearing (D/HH) employees in cafes by transcribing spoken orders into text instantly. Using speech-to-text technology, HIRA enables D/HH individuals to understand customer requests, promoting inclusivity and independence in customer service roles.

---

## Cloud Architecture Overview

### 1. **User Layer (Interface System)**

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

### Serverless Design
This architecture employs a serverless approach, leveraging Google Cloud Run and App Engine for scalability, cost efficiency, and simplified management.

---

## Key Components and Endpoints

### **Bucket-HIRA Overview**
| Folder Name        | Description                                      |
|--------------------|--------------------------------------------------|
| **Uploads**        | General files uploaded by users.                |
| **Audio-uploads**  | Stores audio files from the frontend.           |
| **Transcribed-audio** | Contains transcriptions of processed audio. |
| **Model-HIRA**     | Stores AI models and related files.             |

### **Cloud Run Services**
| Service            | Description                                      | Endpoint                                               |
|--------------------|--------------------------------------------------|-------------------------------------------------------|
| **Backend**        | Processes user requests and handles audio files. | [Backend Service](https://backend-877036409345.asia-southeast2.run.app) |
| **Model API**      | Executes AI/ML tasks, including transcription.   | [Model API Service](https://model-api-877036409345.asia-southeast2.run.app) |

---

## Visual Representations

### **Cloud Architecture Diagram**
![Cloud Architecture Diagram](https://github.com/user-attachments/assets/f8108738-99d0-45cb-81e0-ad9fffbac271)

### **Bucket Organization**
![Bucket Organization](https://github.com/user-attachments/assets/7743780d-0129-49c2-acf4-7c264ff6312b)

### **Cloud Run Services**
![Cloud Run Services](https://github.com/user-attachments/assets/a035011a-007a-4a4f-9d1e-8bb54029b4e6)

### **App Engine Overview**
![App Engine Overview](https://github.com/user-attachments/assets/b58be78c-96a4-411f-8dbf-37eb703b701f)

---
### **How to Deploy it:**
1.Gitclone this github
2.Go to backend and use npm i to install all dependencies
3.Dont forget to make bucket like the picture of bucket and set it to public
4.Set the service accounts so the account can use the resource on buckte
5.after you install it go to terminal and set the file docker then use cloud run deploy
6.After Deploy it you get the end point of backend
7.then input it to the model
8.After that set up like backend but dont forget to install tensordlowjs like teh dependencise
9.then use gcloud run deploy, but dont forget to make the dockerfile
10.Then go to frontend and add the  model end-point and backend-end point
11.Make the yaml.file
12.Then deploy it with command gcloud appdeploy
-- dont forget to use the most near region--

**This is Our Code:**
https://github.com/BerlinNapoleon/HIRA-Hear-Assistant-/tree/WEB-Branch
HIRA is designed to be a robust, inclusive solution for D/HH employees, leveraging modern cloud technologies to enhance accessibility and independence.

