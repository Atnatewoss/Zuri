# Zuri Demo Data - Master Guide

This directory contains high-fidelity demo data for three premier resorts in Ethiopia. You can use this data to manually populate your Zuri Admin Panel for a professional demo.

## Directory Structure
- `data/kuriftu/`: Detailed data for Kuriftu Resort & Spa (Bishoftu).
- `data/haile/`: Detailed data for Haile Resort (Hawassa).
- `data/sheraton/`: Detailed data for Sheraton Addis (Addis Ababa).

## How to use for Manual Upload

### 1. Knowledge Base (RAG)
For each resort, find the `knowledge.txt` file or the `[Knowledge Base]` section in `FULL_PROFILE.md`. 
- **Upload**: Go to the **Knowledge Base** section of the panel and upload the `.txt` file.
- **Effect**: Once processed, the AI chatbot will be able to answer any question about that resort's facilities, rooms, and history.

### 2. Services
Find the `services.txt` file or the `[Services List]` section in `FULL_PROFILE.md`.
- **Manual**: Use the information (Name, Price, Availability) to fill in the "Add Service" forms.
- **Bulk**: If you want to use the bulk API I implemented, copy the multi-line text and send it to `POST /api/services/bulk?hotel_id=<id>`.

### 3. Rooms
Find the `rooms.txt` file or the `[Rooms List]` section in `FULL_PROFILE.md`.
- **Manual**: Fill in the Room Type, Price, and Availability in the "Add Room" section.
- **Bulk**: Copy the multi-line text and send it to `POST /api/rooms/bulk?hotel_id=<id>`.

## Multi-Tenant IDs
Generated for each resort helping them get their own AI Specific to their use case.
