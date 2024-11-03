# Ascend - Your Project Management Tool

**Ascend** is a collaborative project management tool that streamlines workflows, enhances communication, and drives team success. Designed as a Progressive Web Application (PWA), Ascend combines the efficiency of a SaaS platform with the convenience of a mobile app, helping teams get things done effortlessly.

---

## 🌟 Features

- **Kanban Boards**: Track tasks visually and stay organized with easy-to-use Kanban boards.
- **Sprint Planning**: Plan sprints with ease to keep your team on track and focused on goals.
- **Reporting and Analytics**: Access intuitive, data-driven insights for team progress.
- **Cross-Device Access**: Use Ascend on both desktop and mobile with seamless PWA functionality.
- **Secure Access**: User authentication with Clerk ensures data security across the platform.
- **Enhanced UI**: A modern, user-friendly interface designed with React, Next.js, and Tailwind CSS.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## 🧑‍💻 How It Works

1. **Sign Up and Log In**

   - Create your account and access the Ascend dashboard.

2. **Set Up Your Organization**

   - Create or join an organization to start managing team projects in a shared workspace.

3. **Create Projects and Manage Tasks**

   - Add projects, organize tasks with Kanban boards, and assign team members to streamline workflows.

4. **Plan and Execute Sprints**

   - Schedule sprints, set priorities, and track task progress to meet deadlines.

5. **Track Progress with Reports**

   - Get real-time insights into project progress with intuitive reports.

---

## 🚀 Getting Started

To get started with Ascend, simply install it on your local environment by following the setup instructions below. Ensure you have Node.js and npm installed on your system.

### Prerequisites

- **Node.js**: Make sure Node.js (version 14 or higher) is installed. [Download Node.js](https://nodejs.org/)
- **NPM**: NPM usually comes with Node.js, but you can update it by running:
  ```bash
  npm install -g npm
  ```

### Clone the Repository

```bash
git clone https://github.com/ketankumavat/ascend.git
cd ascend
```

## 🔧 Installation

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Environment Variables**:

    - Create a `.env.local` file in the root directory.
    - Add necessary environment variables for Prisma, Clerk authentication, and database connection:

    ```plaintext
    DATABASE_URL=<your_database_url>
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk_publishable_key>
    CLERK_SECRET_KEY=<clerk_secret_key>
    ```

    - These credentials are essential for configuring Prisma and Clerk authentication.

3.  **Run Prisma Migrations**:

    ```bash
    npx prisma migrate dev
    ```

4.  **Run the Development Server**:

    ```bash
    npm run dev
    ```

    Now, open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 💻 Usage

1. **Kanban Boards**: Add, assign, and update tasks in real-time with a drag-and-drop interface.
2. **Sprint Planning**: Create sprints, set goals, and align tasks to ensure smooth project execution.
3. **Reporting**: Access team reports to view progress and insights, helping keep everyone accountable.
4. **PWA Features**: Install Ascend as a PWA to access it offline and as a standalone app on mobile.

---

## 🛠 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn
- **Backend**: Node.js, Prisma, Neon DB, Express
- **Authentication**: Clerk

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

For major changes, please open an issue first to discuss what you would like to change.

---

Enjoy using **Ascend** and happy project managing!
