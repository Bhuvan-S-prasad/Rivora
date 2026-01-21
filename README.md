# RIVORA
<div align="center">
  <img src="https://ik.imagekit.io/wq68aygdr/b_Design_a_simple,_min.png?tr=w-200,h-200,fo-center,r-max" width="200" height="200" alt="logo" />
</div>

Rivora is a modern, full-stack social media application designed to foster meaningful connections through conversations and community-driven interactions. Built with performance and user experience at its core, Rivora allows users to share "Echoes", engage in deep discussions, and form communities known as "Rifts".

## Technical Architecture

Rivora is built on a robust, scalable architecture leveraging the latest web technologies:

*   **Framework**: **Next.js 16 (App Router)** serves as the backbone, utilizing React Server Components for efficient data fetching and server-side rendering.
*   **Database**: **MongoDB** with **Mongoose** ORM provides a flexible document-oriented schema design, essential for handling complex relationship data like comments and user networks.
*   **Authentication**: Integrated **Clerk** middleware ensures secure, seamless user management and route protection.
*   **Styling System**: **Tailwind CSS v4** combined with **Radix UI** primitives delivers a highly responsive, accessible, and theme-able interface.
*   **File Storage**: **UploadThing** handles media assets, ensuring optimized image delivery for user profiles and content.

### System Flow

![System Flow](https://ik.imagekit.io/wq68aygdr/image.png)

### Data Flow
1.  **Server Actions**: All mutations (creating Echoes, updating profiles) are handled via Next.js Server Actions in `lib/actions`, providing a secure direct-to-database communication channel without exposing API endpoints.
2.  **Validation Layer**: **Zod** schemas enforce data integrity on both client-side forms and server-side operations.
3.  **Optimization**: Optimistic UI updates and efficient caching strategies ensure the application feels instant and responsive.

## Tech Stack & Skills

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Zod](https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![UploadThing](https://img.shields.io/badge/UploadThing-EB364B?style=for-the-badge&logo=uploadthing&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)

## Key Features

*   **Echoes**: A comment system allowing for structured replies and conversations.
*   **Rifts**: Dedicated spaces for users to gather around shared interests.
*   **Activity Feed**: Real-time aggregation of interactions, replies, and mentions.
*   **User Profiles**: Fully customizable profiles with bios and media integration.
*   **Search Discovery**: Fast, optimized search functionality for finding users and communities.

## Acknowledgments

This project is made possible by the incredible open-source community. Special thanks to the teams behind these technologies:

*   **Next.js** - For redefining the React framework standard.
*   **Clerk** - For solving the complexity of identity and user management.
*   **MongoDB** - For providing an agile database solution.
*   **Tailwind CSS** - For enabling rapid, utility-first design.
*   **UploadThing** - For simplifying file uploads for developers.
*   **Lucide React** - For the clean, consistent icon set used throughout the app.
*   **Shadcn UI / Radix** - For the foundational accessible components.