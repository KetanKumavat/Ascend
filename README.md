# Ascend - Your Project Management Tool 🚀

**Ascend** is a modern, collaborative project management tool designed to simplify workflows, boost productivity, and enhance team communication. Whether you're planning sprints, tracking tasks, or generating insights, Ascend helps teams achieve their goals with precision.

---

## 🌟 Features

- **Kanban Boards**: Visualize tasks with drag-and-drop ease for better organization.
- **Sprint Planning**: Keep your team focused with streamlined sprint management.
- **Automated GitHub Commit Reports**: Generate end-of-day reports summarizing GitHub commit activity to keep everyone aligned.
- **Real-Time Reporting**: Leverage actionable insights into project progress and team performance.
- **Secure Authentication**: Powered by Clerk for robust user management and data security.
- **Enhanced UI/UX**: Built with Next.js and Tailwind CSS for a sleek and intuitive experience.

---

## 📋 Table of Contents

1. [How It Works](#-how-it-works)
2. [Getting Started](#-getting-started)
3. [Installation](#-installation)
4. [Usage](#-usage)
5. [Tech Stack](#-tech-stack)
6. [Contributing](#-contributing)

---

## 🧑‍💻 How It Works

1. **Sign Up and Log In**
   - Quickly create an account and access your personalized Ascend dashboard.

2. **Set Up Your Organization**
   - Start managing team projects in a collaborative workspace.

3. **Manage Projects and Tasks**
   - Create projects, organize tasks with Kanban boards, and assign team members to ensure efficient workflows.

4. **Plan and Execute Sprints**
   - Schedule, prioritize, and track sprint progress to meet your team’s goals.

5. **Automated GitHub Commit Reports**
   - Link GitHub repositories to your projects and get automated end-of-day commit reports, summarizing key updates and changes.

6. **Track and Report Progress**
   - Access real-time, visually intuitive reports to monitor team performance and milestones.

---

## 🚀 Getting Started

Ready to experience Ascend? Follow these steps to set up and explore the tool.

### Prerequisites

- **Node.js**: Ensure you have Node.js (v14 or higher) installed. [Download Node.js](https://nodejs.org/)
- **NPM**: Update npm if necessary:
  ```bash
  npm install -g npm
  ```

---

### Clone the Repository

```bash
git clone https://github.com/ketankumavat/ascend.git
cd ascend
```

---

## 🔧 Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   - Create a `.env.local` file in the root directory.
   - Configure the following variables:
     ```plaintext
     DATABASE_URL=<your_database_url>
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk_publishable_key>
     CLERK_SECRET_KEY=<clerk_secret_key>
     GITHUB_PERSONAL_ACCESS_TOKEN=<your_github_access_token>
     ```

3. **Run Prisma Migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to access the app.

---

## 💻 Usage

1. **Kanban Boards**: Manage tasks visually with a simple drag-and-drop interface.
2. **Sprint Planning**: Organize, assign, and execute tasks effectively to hit deadlines.
3. **Automated Daily Report**: Connect GitHub repositories to projects and automatically generate daily reports summarizing contributions.
4. **Real-Time Insights**: Use intuitive reporting tools to track team and project performance.

---

## 🛠 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn
- **Backend**: Node.js, Prisma, Neon DB, Express
- **Authentication**: Clerk
- **Integrations**: GitHub API for commit tracking and reporting

---

## 🤝 Contributing

We welcome contributions, feature requests, and bug reports!

### Steps to Contribute:

1. **Fork the Project**: Click on the "Fork" button in GitHub.
2. **Create a Feature Branch**: 
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. **Commit Changes**:
   ```bash
   git commit -m "Add YourFeatureName"
   ```
4. **Push to Branch**:
   ```bash
   git push origin feature/YourFeatureName
   ```
5. **Open a Pull Request**: Submit your PR for review.

For significant changes, please open an issue first to discuss your ideas.

---