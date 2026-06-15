# CV STEM Guide

**Central Valley STEM resources provider.**

To students looking for futures in STEM, living in the Central Valley, but unsure where to start? CV STEM Guide is the website for you!

---

## What Is CV STEM Guide?

CV STEM Guide is a free, no-sign-up resource built by a Central Valley student, for Central Valley students. It collects STEM programs, scholarships, and competitions from across 18 Central Valley counties into one place so that students do not have to dig through dozens of websites to find opportunities that are actually available to them.

The Central Valley is one of the most underserved regions in California when it comes to STEM access. More than 50% of students in the area identify as economically disadvantaged, and most schools report a shortage of advanced STEM programs. CV STEM Guide exists to close that information gap.

---

## What Is On the Site?

CV STEM Guide now covers **every engineering discipline** -- mechanical, materials, civil & structural,
electrical & computer, chemical & biochemical, nuclear, environmental & agricultural, aerospace, biomedical,
industrial & systems, and computer science -- not just aerospace.

- **Programs** -- Free and paid STEM programs for grades 6 through 12, including residential summer schools, national-lab internships (Lawrence Livermore, Sandia), university research, community-college transfer pathways, and online courses
- **Scholarships** -- Local and statewide scholarships for Central Valley students pursuing any engineering or STEM degree
- **Competitions** -- Free, high-impact competitions across every discipline that look strong on college applications
- **Tips** -- Practical advice on how to actually use these opportunities to strengthen a college application

Every listing can be filtered by **engineering field, county, type, grade level, and cost**, searched by
keyword, and sorted by **deadline** -- with a "closing soon" highlight for anything due in the next 30 days.

---

## Counties Covered

Butte, Colusa, Fresno, Glenn, Kern, Kings, Madera, Merced, Placer, Sacramento, San Joaquin, Shasta, Stanislaus, Sutter, Tehama, Tulare, Yolo, Yuba

---

## How to Use It

1. Visit [cvstemguide.com](https://cvstemguide.com)
2. Click your county to filter programs available near you
3. Use the search bar to find programs by topic, grade, or keyword
4. Click "Learn More" on any card to go directly to the program's official website

No account required. No cost. Ever.

---

## How to Contribute

Know a program, scholarship, or competition that should be listed here? It takes two minutes to submit.

Open an Issue on this repository with the following information:

- Program name
- Organization running it
- Link to the official website
- Grade levels eligible
- Cost (free or paid)
- Counties or regions it serves
- Brief description (2 to 3 sentences)

Submissions are reviewed and added on a rolling basis. Every addition helps another Central Valley student find an opportunity they would have otherwise missed.

---

## Tech Stack

This site is a multi-page static site with no frameworks, no backend, and no build step. It is hosted on GitHub Pages and served at a custom domain. All filtering and search logic runs client-side in vanilla JavaScript.

This keeps it fast, free to host, and easy for anyone to audit or contribute to.

### Project structure

```
/                  index.html          Home
/explore/          index.html          Unified searchable, filterable directory
/about/            index.html          Story, disciplines, counties, tips, creator
/contribute/       index.html          How to submit a resource + live resource counter
404.html                               Friendly not-found page
sitemap.xml                            Search-engine sitemap
robots.txt                             Crawler directives -> sitemap
/styles/           base.css            Design tokens, reset, typography
                   components.css      Nav, hero, cards, explorer, placeholders, footer
/scripts/          data.js             All resources (single source of truth)
                   ui.js               Card rendering, deadlines + the Explorer
                   main.js             Nav, mobile menu, counters, scroll animations
/assets/           favicon.svg
                   og-cover.svg        Social-share (Open Graph) image
CNAME                                  Custom domain
```

### Adding or editing a resource

Every resource is one object in [`scripts/data.js`](scripts/data.js) inside `PROGRAMS`,
`SCHOLARSHIPS`, or `COMPETITIONS`. The file's header comment documents the full object shape:
`fields` (engineering disciplines), `gradeMin`/`gradeMax`, `counties`, `cost`/`free`,
a recurring `deadline` (`"MM-DD"`, which the site turns into the next upcoming date automatically),
and the official `link`. The homepage stats and the contributor counter are computed from this file,
so they update themselves the moment you add a listing.

Pages use **clean, folder-based URLs** (`cvstemguide.com/about`, `/explore`, `/contribute`)
served natively by GitHub Pages, with no router or redirects required. All resource data
lives in [`scripts/data.js`](scripts/data.js); to add a program, scholarship, or
competition, append an object there (or open an issue and it will be added for you).

### Local preview

No build needed, it's static files. Serve the folder from its root with any static
server, e.g. `npx serve .` or `python -m http.server 8000`, then open the printed URL.

> `.claude/` holds an optional local-preview helper used during development; it is not
> part of the deployed site and can be ignored or removed.

---

## About the Creator

CV STEM Guide was built by a high school student from Patterson, California. Growing up in the Central Valley and seeing firsthand how few STEM resources were visible or accessible to local students, the goal was simple: build the resource that should have already existed.

If this site helped you find a program or scholarship, consider sharing it with a classmate, a school counselor, or a local library. The more students who know it exists, the more useful it becomes.

---

## License

This project is open source under the MIT License. Feel free to fork it, adapt it for your own region, and build something similar for students near you.

---

*Last updated: June 2026*
