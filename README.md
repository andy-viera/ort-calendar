<div id="top"></div>

<div align="center">

[![GitHub Contributors](https://img.shields.io/github/contributors/andy-viera/ort-calendar?style=for-the-badge)](https://github.com/andy-viera/ort-calendar/graphs/contributors)
[![GitHub Forks](https://img.shields.io/github/forks/andy-viera/ort-calendar?style=for-the-badge)](https://github.com/andy-viera/ort-calendar/network/members)
[![GitHub Stars](https://img.shields.io/github/stars/andy-viera/ort-calendar?style=for-the-badge)](https://github.com/andy-viera/ort-calendar/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/andy-viera/ort-calendar?style=for-the-badge)](https://github.com/andy-viera/ort-calendar/issues)

</div>

<br />
<div align="center">
  <br/>
<i>Tus eventos del semestre, directo a tu calendario, en un click.</i>
  <br/>
  <br/>
  <h1><i>ORT Calendar</i></h1>

  <p align="center">
    <a href="https://ortcal.aviera.me/"><strong><u>Check it out &raquo;</u></strong></a>
    <br/>
    <br/>
    <a href="https://github.com/andy-viera/ort-calendar/issues/new?labels=enhancement"><u>Suggest a Feature</u></a>
    &middot;
    <a href="https://github.com/andy-viera/ort-calendar/issues/new?labels=bug"><u>Report a Bug</u></a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#overview">Overview</a>
      <ul>
         <li><a href="#features">Features</a></li>
         <li><a href="#technologies">Technologies</a></li>
      </ul>
    </li>
    <li>
      <a href="#contributing">Contributing</a>
      <ul>
        <li><a href="#reporting-bugs--suggesting-enhancements">Reporting Bugs & Suggesting Enhancements</a></li>
        <li><a href="#fixing-issues">Fixing Issues</a></li>
        <li><a href="#setting-up-locally">Setting Up Locally</a></li>
      </ul>
    </li>
    <li><a href="#get-in-touch">Get in Touch</a></li>
  </ol>
</details>

## Overview

**_ORT Calendar_** is a free, open-source tool for engineering students at Universidad ORT Uruguay. It automatically collects exam dates, assignment deadlines, and second-chance exams from the official academic PDFs published by Bedelia, and lets you subscribe to a filtered calendar with just your subjects.

No accounts, no logins, no complications.

### Features

- **One-click calendar subscription:** Add your semester events directly to Google Calendar or Apple Calendar.
- **Filter by career & subjects:** Only see the events that matter to you.
- **Turno filtering:** Switch between matutino and nocturno schedules.
- **Auto-updating:** If a date changes during the semester, your calendar updates automatically.
- **Multiple careers:** Currently supports Ingenieria en Sistemas, Ingenieria Electrica, Ingenieria Electronica, and Biotecnologia.

### Technologies

**Frontend:**

- [TypeScript](https://www.typescriptlang.org/)
- [React 19](https://react.dev/)
- [Next.js 16](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

**Calendar Generation:**

- [ics](https://github.com/adamgibbons/ics) — ICS file generation
- Google Calendar URL API

**DevOps:**

- [Vercel](https://vercel.com/)

**Data Pipeline:**

- [Python](https://www.python.org/)
- [Playwright](https://playwright.dev/) — PDF scraping
- Custom PDF parsing scripts

## Contributing

Contributions are highly appreciated! Here's how you can get involved:

### Reporting Bugs & Suggesting Enhancements

If you encounter an issue or have a suggestion for improvement, please create a [GitHub issue](https://github.com/andy-viera/ort-calendar/issues).

### Fixing Issues

1. Find an open issue in the [Issues tab](https://github.com/andy-viera/ort-calendar/issues).
2. Fork the repository and create a feature branch.
3. Submit a pull request with a clear description of your changes.

### Setting Up Locally

#### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

#### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/andy-viera/ort-calendar.git
   ```

2. Navigate to the project folder:

   ```sh
   cd ort-calendar
   ```

3. Install dependencies:

   ```sh
   npm install
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

## Get in Touch

Andres Viera - contact@aviera.me
