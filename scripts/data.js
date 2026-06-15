/* ============================================================
   CV STEM Guide - Data
   Single source of truth for every resource. Loaded as a plain
   script (no build step); attaches to the global `CVSTEM`.

   ------------------------------------------------------------
   HOW TO ADD A RESOURCE
   ------------------------------------------------------------
   Append an object to PROGRAMS, SCHOLARSHIPS, or COMPETITIONS.
   Every object uses the same shape:

   {
     id:       "kebab-case-unique-id",        // stable, never reuse
     title:    "Official program name",
     org:      "Organization that runs it",
     desc:     "2-3 sentences. What it is + why it matters.",
     fields:   ["mechanical","aerospace"],     // one or more FIELD keys (below)
     gradeMin: 9, gradeMax: 12,                 // numeric grade range (6-12)
     grades:   "9 to 12",                       // human-readable grade label
     counties: "all"  OR  ["Fresno","Kern"],    // "all" = open statewide/nationally
     cost:     "Free"  OR  "$250"  etc.,         // human-readable cost label
     free:     true | false,                     // drives the "Free only" filter + badge
     deadline: "02-06" | null,                   // RECURRING month-day, or null if rolling/varies
                                                 //   -> the site computes the *next* occurrence
                                                 //      automatically, so it never goes stale.
     timing:   "Summer (June-August)",           // human-readable window
     link:     "https://official-site...",       // ALWAYS the official page
     icon:     "🚀",
     badges:   ["online"]                         // optional: residential | online | competition | scholarship
   }

   Deadlines are approximate and recurring; students should always
   confirm the exact current-cycle date on the official site.
   ============================================================ */
window.CVSTEM = window.CVSTEM || {};

/* The 18 Central Valley counties this guide serves. */
CVSTEM.COUNTIES = ["Butte","Colusa","Fresno","Glenn","Kern","Kings","Madera","Merced","Placer","Sacramento","San Joaquin","Shasta","Stanislaus","Sutter","Tehama","Tulare","Yolo","Yuba"];

/* Engineering / STEM disciplines used for filtering. "general" is a
   catch-all for broad, multi-discipline programs. The other 11 keys are
   the engineering fields the guide explicitly covers. */
CVSTEM.FIELDS = [
  { key: "mechanical",    label: "Mechanical" },
  { key: "materials",     label: "Materials" },
  { key: "civil",         label: "Civil & Structural" },
  { key: "electrical",    label: "Electrical & Computer" },
  { key: "chemical",      label: "Chemical & Biochem" },
  { key: "nuclear",       label: "Nuclear" },
  { key: "environmental", label: "Environmental & Ag" },
  { key: "aerospace",     label: "Aerospace" },
  { key: "biomedical",    label: "Biomedical" },
  { key: "industrial",    label: "Industrial & Systems" },
  { key: "cs",            label: "Computer Science" },
  { key: "general",       label: "General / Multi" },
];

/* ============================================================
   PROGRAMS
   ============================================================ */
CVSTEM.PROGRAMS = [
  { id:"cosmos", icon:"🔬", title:"COSMOS: California State Summer School for Math & Science", org:"University of California",
    desc:"A four-week residential program at UC campuses including UC Merced, UC Davis, and UC Irvine. Students work directly with university faculty on real STEM research across clusters spanning engineering, computer science, biology, and physics. One of California's most respected pre-college programs.",
    fields:["general","aerospace","mechanical","biomedical","cs","environmental"], gradeMin:8, gradeMax:12, grades:"8 to 12",
    cost:"~$4,890 (need-based aid to $0)", free:false, deadline:"02-06", timing:"Summer (July-August)",
    link:"https://cosmos-ucop.ucdavis.edu/", badges:["residential"], counties:"all" },

  { id:"ucm-stem-outreach", icon:"🐾", title:"UC Merced Summer STEM Outreach Programs", org:"UC Merced, School of Natural Sciences",
    desc:"Free week-long summer programs with hands-on activities, lab tours, lectures, and direct interaction with UC Merced scientists and engineers. UC Merced is the closest research university to much of the Central Valley, roughly 45 minutes from Modesto and Fresno.",
    fields:["general","biomedical","chemical","environmental"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:null, timing:"Summer",
    link:"https://naturalsciences.ucmerced.edu/content/summer-stem-outreach-programs", badges:[], counties:["Merced","Stanislaus","Madera","Fresno","San Joaquin","Kings","Tulare"] },

  { id:"ucm-bobcat-academy", icon:"🎒", title:"Bobcat Summer STEM Academy", org:"UC Merced CalTeach",
    desc:"Multi-day STEM academies held on the UC Merced campus each summer, with high school sessions open to students entering grade 9 through 12. A low-cost way to experience a research university campus close to home and explore engineering and science hands-on.",
    fields:["general","mechanical","cs","industrial"], gradeMin:8, gradeMax:12, grades:"8 to 12",
    cost:"Varies by academy — see site", free:false, deadline:null, timing:"Summer (June-July)",
    link:"https://calteach.ucmerced.edu/bobcat-summer-stem-academy", badges:[], counties:["Merced","Stanislaus","Madera","Fresno","San Joaquin","Kings","Tulare"] },

  { id:"ucm-cs-internship", icon:"💻", title:"UC Merced High School Computer Science Internship", org:"UC Merced Inclusive Interaction Lab",
    desc:"A free summer internship that gives high schoolers early, hands-on exposure to software development and human-computer interaction research alongside UC Merced faculty and graduate students. Started in 2018 to bring local students into real research.",
    fields:["cs","electrical"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:null, timing:"Summer",
    link:"https://news.ucmerced.edu/news/2026/high-school-students-invited-apply-free-computer-science-internship", badges:[], counties:["Merced","Stanislaus","Madera","Fresno","San Joaquin","Kings","Tulare"] },

  { id:"ucm-cold-email", icon:"📧", title:"UC Merced Faculty Research (Cold Email)", org:"UC Merced Engineering",
    desc:"There is no formal application. You write directly to professors and ask to help in their lab over the summer. UC Merced faculty work on UAV and drone systems, robotics, materials, and energy. Self-initiated research like this is one of the most impressive things you can show a college.",
    fields:["aerospace","mechanical","materials","electrical","general"], gradeMin:10, gradeMax:12, grades:"10 to 12",
    cost:"Free (volunteer research)", free:true, deadline:null, timing:"Summer",
    link:"https://engineering.ucmerced.edu/", badges:[], counties:["Stanislaus","San Joaquin","Merced","Fresno","Madera","Kings","Tulare"] },

  { id:"fresno-lyles-camp", icon:"🏗️", title:"Lyles College of Engineering Summer Camps", org:"Fresno State",
    desc:"Five-day summer camps with hands-on engineering, architecture, and construction-management activities that showcase multiple disciplines. Held on the Fresno State campus and built specifically for local Central Valley students in grades 9 through 12.",
    fields:["mechanical","civil","electrical","general"], gradeMin:9, gradeMax:12, grades:"9 to 12 (middle school too)",
    cost:"~$250 (includes lunch)", free:false, deadline:null, timing:"June-July",
    link:"https://engineering.fresnostate.edu/young-minds-explore/summer-camps.html", badges:[], counties:["Fresno","Madera","Kings","Tulare","Merced"] },

  { id:"ucd-ysp", icon:"🌱", title:"UC Davis Young Scholars Program", org:"UC Davis",
    desc:"A six-week residential research program where about 40 students work one-on-one with faculty in biological, agricultural, environmental, and natural sciences, then write a journal-quality paper. Agriculture and environmental science run deep here — a strong fit for Valley students.",
    fields:["environmental","biomedical","chemical","general"], gradeMin:10, gradeMax:11, grades:"Rising 11 to 12",
    cost:"Paid (financial aid available)", free:false, deadline:"03-15", timing:"Summer (6 weeks)",
    link:"https://education.ucdavis.edu/young-scholars-program", badges:["residential"], counties:"all" },

  { id:"ucd-cstem", icon:"🤖", title:"UC Davis C-STEM (Coding & Robotics)", org:"UC Davis C-STEM Center",
    desc:"Brings hands-on coding and robotics into K-12 classrooms across California, with a full pathway up to AP Computer Science Principles. C-STEM courses are UC-approved for admission. Ask your school or counselor whether your district partners with C-STEM.",
    fields:["cs","mechanical","electrical","general"], gradeMin:6, gradeMax:12, grades:"6 to 12",
    cost:"Free (school-based)", free:true, deadline:null, timing:"School year",
    link:"https://c-stem.ucdavis.edu/", badges:[], counties:"all" },

  { id:"sacstate-youth-academies", icon:"🏛️", title:"Summer Youth Academies", org:"Sacramento State",
    desc:"Week-long academies led by Sac State faculty and industry experts across computer science, engineering, AI, and more. Open to students in grades 7 through 12 who want to explore a field and experience life on a college campus in the northern Valley.",
    fields:["cs","electrical","general","industrial"], gradeMin:7, gradeMax:12, grades:"7 to 12",
    cost:"Paid (per academy)", free:false, deadline:null, timing:"Late June-August",
    link:"https://cce.csus.edu/summer-youth-academies", badges:[], counties:["Sacramento","Yolo","Placer","Sutter","Yuba","San Joaquin"] },

  { id:"mesa", icon:"📐", title:"MESA Schools Program", org:"Mathematics, Engineering, Science Achievement (UC)",
    desc:"A long-running California program that gives educationally and financially disadvantaged students academic support, advising, tutoring, and hands-on engineering challenges so they can excel in STEM and reach four-year degrees. Many Valley schools and community colleges host a MESA center.",
    fields:["general","mechanical","electrical","civil","industrial"], gradeMin:6, gradeMax:12, grades:"6 to 12",
    cost:"Free", free:true, deadline:null, timing:"School year",
    link:"https://mesa.ucop.edu/", badges:[], counties:"all" },

  { id:"llnl-summer", icon:"⚛️", title:"LLNL Summer STEM Programs (SAGE & Biotech)", org:"Lawrence Livermore National Laboratory",
    desc:"Lawrence Livermore runs short summer experiences for Northern California high schoolers, including the one-week SAGE camp and a 10-day Biotechnology Summer Experience. Students shadow professionals and work on projects tied to real national-lab research in fields like additive manufacturing and bioengineering.",
    fields:["nuclear","materials","biomedical","mechanical","general"], gradeMin:9, gradeMax:12, grades:"9 to 12 (ages 14-17)",
    cost:"Free", free:true, deadline:null, timing:"Summer",
    link:"https://www.llnl.gov/join-our-team/careers/student-internship-veteran-programs", badges:[], counties:"all" },

  { id:"llf-internship", icon:"🔬", title:"High School Summer Internship Program", org:"Livermore Lab Foundation",
    desc:"A paid summer internship pairing local high schoolers with Lawrence Livermore mentors on two-student teams, working in fields like additive manufacturing (3D printing), bioengineering, and nanotechnology. Created specifically to open the national lab to nearby students.",
    fields:["materials","biomedical","mechanical","nuclear"], gradeMin:11, gradeMax:12, grades:"11 to 12",
    cost:"Free (paid internship)", free:true, deadline:null, timing:"Summer",
    link:"https://livermorelabfoundation.org/", badges:[], counties:["San Joaquin","Stanislaus","Sacramento","Merced"] },

  { id:"sandia-internship", icon:"🧪", title:"Sandia National Labs Student Internships", org:"Sandia National Laboratories (Livermore, CA)",
    desc:"Paid internships for motivated high school students 16+ with a 3.0 GPA, offered at Sandia's Livermore, California campus. Work like a research assistant alongside top scientists and engineers in cybersecurity, engineering design, software, and the sciences.",
    fields:["electrical","mechanical","cs","nuclear","general"], gradeMin:11, gradeMax:12, grades:"11 to 12 (16+)",
    cost:"Free (paid internship)", free:true, deadline:null, timing:"Summer & year-round",
    link:"https://www.sandia.gov/careers/students-postdocs/internships/", badges:[], counties:"all" },

  { id:"asm-materials-camp", icon:"🧲", title:"ASM Materials Camp", org:"ASM Materials Education Foundation",
    desc:"A free, week-long, team-based program where juniors and seniors explore materials science and engineering hands-on, using real instruments under the guidance of professional engineers and researchers. One of the only camps in the country focused specifically on materials.",
    fields:["materials","mechanical","chemical"], gradeMin:11, gradeMax:12, grades:"11 to 12",
    cost:"Free", free:true, deadline:null, timing:"Summer",
    link:"https://www.asmfoundation.org/students/materials-camps/", badges:[], counties:"all" },

  { id:"acs-project-seed", icon:"⚗️", title:"ACS Project SEED", org:"American Chemical Society",
    desc:"A paid 8-to-10-week summer research internship for high schoolers from economically disadvantaged backgrounds, working in real chemistry labs alongside scientist mentors. Running since 1968, it is one of the strongest chemistry research opportunities open to students who qualify.",
    fields:["chemical","biomedical","materials"], gradeMin:10, gradeMax:12, grades:"10 to 12",
    cost:"Free (paid stipend)", free:true, deadline:"03-01", timing:"Summer",
    link:"https://www.acs.org/funding/scholarships-fellowships/project-seed.html", badges:[], counties:"all" },

  { id:"ace-mentor", icon:"📏", title:"ACE Mentor Program", org:"ACE Mentor Program of America",
    desc:"A free after-school program that pairs students with working architects, engineers, and construction professionals to tackle a real mock design project. The clearest on-ramp into civil, structural, and construction careers — find a local affiliate to join.",
    fields:["civil","mechanical","electrical","industrial","general"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:null, timing:"School year (Oct-Apr)",
    link:"https://www.acementor.org/students/students-overview/", badges:[], counties:"all" },

  { id:"mit-mites", icon:"🎓", title:"MITES Summer", org:"Massachusetts Institute of Technology",
    desc:"A free, intensive six-week residential program at MIT for high school juniors, especially those from underrepresented or underserved backgrounds, who intend to pursue science and engineering. All food and housing are covered. Extremely competitive and highly respected.",
    fields:["general","mechanical","electrical","aerospace","cs","materials"], gradeMin:11, gradeMax:11, grades:"11",
    cost:"Free", free:true, deadline:"02-01", timing:"Summer (6 weeks)",
    link:"https://mites.mit.edu/discover-mites/mites-summer/", badges:["residential"], counties:"all" },

  { id:"mit-bwsi", icon:"🛰️", title:"Beaver Works Summer Institute", org:"MIT Lincoln Laboratory",
    desc:"A rigorous, project-based four-week STEM program for rising seniors with courses like Build-a-CubeSat, autonomous RACECAR, medical AI, and embedded security. Tuition-free for families under $200K income; you qualify by completing an online spring prerequisite course.",
    fields:["cs","electrical","aerospace","biomedical","general"], gradeMin:11, gradeMax:12, grades:"Rising 12",
    cost:"Free under $200K income", free:true, deadline:null, timing:"Summer (spring prereq)",
    link:"https://bwsi.mit.edu/", badges:[], counties:"all" },

  { id:"ssp", icon:"🌌", title:"Summer Science Program", org:"Summer Science Program",
    desc:"A five-to-six-week residential program with tracks in astrophysics, biochemistry, genomics, and synthetic chemistry, where student teams complete real research such as calculating an asteroid's orbit. Generous need-based aid frequently brings the cost to zero. Highly selective and well-regarded.",
    fields:["aerospace","chemical","biomedical","materials"], gradeMin:10, gradeMax:12, grades:"10 to 12",
    cost:"Up to ~$9,800 (need-based aid to $0)", free:false, deadline:"02-15", timing:"Late June-early August",
    link:"https://summerscience.org/", badges:["residential"], counties:"all" },

  { id:"stanford-smysp", icon:"🩺", title:"Stanford Medical Youth Science Program", org:"Stanford University",
    desc:"A free five-week residential program for low-income and underrepresented juniors from Northern and Central California, with intensive science training and mentorship from working medical professionals. Central Valley students are genuinely recruited for this one.",
    fields:["biomedical","general"], gradeMin:11, gradeMax:11, grades:"11",
    cost:"Free", free:true, deadline:"03-23", timing:"Summer (5 weeks)",
    link:"https://smysp.spcs.stanford.edu/", badges:["residential"], counties:["Fresno","Kern","Kings","Madera","Merced","San Joaquin","Stanislaus","Tulare","Sacramento"] },

  { id:"girls-who-code", icon:"👩‍💻", title:"Girls Who Code Summer Program", org:"Girls Who Code",
    desc:"A free, flexible, fully virtual summer program where high school girls and nonbinary students learn coding and AI and build purpose-driven projects at their own pace, with optional live events and mentorship. No prior experience needed.",
    fields:["cs"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:null, timing:"Summer (7 weeks)",
    link:"https://girlswhocode.com/programs", badges:["online"], counties:"all" },

  { id:"erau-summer", icon:"🛩️", title:"Embry-Riddle Summer Programs", org:"Embry-Riddle Aeronautical University",
    desc:"Week-long camps in aviation, aerospace engineering, robotics, and space science at Embry-Riddle's Daytona Beach and Prescott campuses. Embry-Riddle is one of the most well-known aerospace universities in the country, so attending signals a serious interest in the field.",
    fields:["aerospace","mechanical"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"$1,200-$2,000 per week", free:false, deadline:null, timing:"June-July",
    link:"https://summercamps.erau.edu/", badges:["residential"], counties:"all" },

  { id:"mjc-dual-enrollment", icon:"🎟️", title:"Modesto Junior College Dual Enrollment", org:"Modesto Junior College",
    desc:"Earn free, transferable college credit while still in high school — starting as young as age 13 — through online, on-campus, and on-your-high-school-campus (CCAP) courses. A practical, low-cost head start on an engineering or computer science transfer pathway in Stanislaus County.",
    fields:["general","cs","mechanical","civil"], gradeMin:9, gradeMax:12, grades:"9 to 12 (13+)",
    cost:"Free (dual enrollment)", free:true, deadline:null, timing:"Year-round",
    link:"https://www.mjc.edu/outreach/dualenrollment.html", badges:[], counties:["Stanislaus"] },

  { id:"fcc-engineering", icon:"⚙️", title:"Fresno City College Engineering Transfer", org:"Fresno City College",
    desc:"Associate degrees for transfer in civil, electrical, mechanical/aerospace, and computer/software engineering that guarantee a clear, low-cost path to a CSU. A strong, affordable two-year route into an engineering bachelor's degree for Fresno-area students.",
    fields:["civil","electrical","mechanical","aerospace","cs"], gradeMin:11, gradeMax:12, grades:"11 to 12 (transfer)",
    cost:"Low (community college)", free:false, deadline:null, timing:"Year-round",
    link:"https://www.fresnocitycollege.edu/academics/divisions/math-science-and-engineering-division/engineering.html", badges:[], counties:["Fresno","Madera","Kings"] },

  { id:"bakersfield-engineering", icon:"🛠️", title:"Bakersfield College Engineering & MESA", org:"Bakersfield College",
    desc:"An engineering program with tracks that prepare students to transfer into mechanical, aerospace, electrical, or civil engineering at CSU Bakersfield and beyond, plus a MESA center that supports underrepresented STEM students in Kern County.",
    fields:["mechanical","aerospace","electrical","civil"], gradeMin:11, gradeMax:12, grades:"11 to 12 (transfer)",
    cost:"Low (community college)", free:false, deadline:null, timing:"Year-round",
    link:"https://www.bakersfieldcollege.edu/academics/pathways/stem/engineering.html", badges:[], counties:["Kern"] },

  { id:"delta-engineering", icon:"🔧", title:"San Joaquin Delta College Engineering", org:"San Joaquin Delta College",
    desc:"Lower-division engineering coursework designed to transfer as a junior to any four-year engineering program in California, with strong transfer-center support. The Central Valley's top destination in San Joaquin County for affordable transfer units.",
    fields:["general","mechanical","electrical","civil"], gradeMin:11, gradeMax:12, grades:"11 to 12 (transfer)",
    cost:"Low (community college)", free:false, deadline:null, timing:"Year-round",
    link:"https://deltacollege.edu/program/engineering", badges:[], counties:["San Joaquin"] },

  { id:"merced-engineering", icon:"🧰", title:"Merced College Engineering Transfer", org:"Merced College",
    desc:"The first two years of an engineering degree, built to transfer at the junior level — including a guaranteed admission pathway via an Associate Degree for Transfer. A flexible, affordable start within minutes of UC Merced.",
    fields:["general","mechanical","electrical","civil"], gradeMin:11, gradeMax:12, grades:"11 to 12 (transfer)",
    cost:"Low (community college)", free:false, deadline:null, timing:"Year-round",
    link:"https://catalog.mccd.edu/pages/vcnNUlYUI9bbHdBfdZA2", badges:[], counties:["Merced","Madera"] },
];

/* ============================================================
   SCHOLARSHIPS
   ============================================================ */
CVSTEM.SCHOLARSHIPS = [
  { id:"pge-better-together", icon:"💡", title:"Better Together STEM Scholarship", org:"PG&E Foundation",
    desc:"Awards of $2,500, $5,000, or $10,000 for students in PG&E's Northern and Central California service area pursuing engineering, computer science, cybersecurity, environmental science, math, or physics. Built for exactly this region — a top scholarship for Valley students.",
    fields:["electrical","environmental","cs","mechanical","general"], gradeMin:12, gradeMax:12, grades:"12 (and undergrad)",
    cost:"Free to apply", free:true, deadline:"03-12", timing:"Apply by March",
    link:"https://www.pge.com/en/about/educational-resources/grants-and-scholarships.html", badges:["scholarship"], counties:"all" },

  { id:"edison-scholars", icon:"⚡", title:"Edison Scholars Program", org:"Edison International",
    desc:"$50,000 scholarships for graduating seniors pursuing STEM at a four-year university, designed for students from underserved communities within Southern California Edison's service area, which reaches parts of the southern Central Valley. Requires a 3.0 GPA and demonstrated financial need.",
    fields:["electrical","mechanical","general","cs"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:null, timing:"Apply in fall of senior year",
    link:"https://www.edison.com/community/edison-scholars", badges:["scholarship"], counties:["Fresno","Kern","Kings","Madera","Tulare"] },

  { id:"cvcf-scholarships", icon:"🌻", title:"Central Valley Community Foundation Scholarships", org:"Central Valley Community Foundation",
    desc:"Nearly 240 scholarships awarded every year, several focused on STEM fields, serving students across the central Valley. Based in Fresno with reach across the region — a single application can match you to many awards.",
    fields:["general"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:null, timing:"Apply in spring of senior year",
    link:"https://www.centralvalleycf.org/scholarships", badges:["scholarship"], counties:["Fresno","Madera","Kings","Tulare","Merced","Kern"] },

  { id:"stancf-scholarships", icon:"🤝", title:"Stanislaus Community Foundation Scholarships", org:"Stanislaus Community Foundation",
    desc:"Multiple scholarships for Stanislaus County students, including STEM-specific awards for students heading directly into STEM degrees. General awards for the Modesto and Turlock areas are also available.",
    fields:["general"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:null, timing:"Spring of senior year",
    link:"https://www.stanislauscf.org/scholarships", badges:["scholarship"], counties:["Stanislaus"] },

  { id:"sjcf-scholarships", icon:"🔭", title:"San Joaquin Community Foundation Scholarships", org:"San Joaquin Community Foundation",
    desc:"Multiple scholarships for San Joaquin County students, including a fund supporting Manteca Unified seniors headed toward STEM or medical fields, with a strong focus on underrepresented students throughout the county. One application covers all of their awards.",
    fields:["general","biomedical"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:null, timing:"Spring of senior year",
    link:"https://sanjoaquincf.org/scholarships/", badges:["scholarship"], counties:["San Joaquin"] },

  { id:"cv-scholars", icon:"🏆", title:"Central Valley Scholars", org:"Central Valley Scholars",
    desc:"Scholarships set aside specifically for Central Valley students, focused on recognizing local talent and supporting students who may not have had the same college-prep access students in other parts of the state take for granted. Check the site for the current cycle.",
    fields:["general"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:null, timing:"Check website for deadlines",
    link:"https://www.centralvalleyscholars.org/", badges:["scholarship"], counties:"all" },

  { id:"shpe-scholarship", icon:"🧑‍🔧", title:"SHPE Scholarship Program", org:"Society of Hispanic Professional Engineers",
    desc:"Scholarships of roughly $2,000 to $10,000 for Hispanic graduating seniors planning to study a STEM field at a two- or four-year college. Requires junior SHPE membership and a minimum GPA. A natural fit for the Valley's large Latino student population.",
    fields:["mechanical","civil","electrical","chemical","aerospace","general"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:"02-16", timing:"Spring cycle (~February)",
    link:"https://shpe.org/engage/programs/scholarshpe/", badges:["scholarship"], counties:"all" },

  { id:"swe-scholarship", icon:"👩‍🔬", title:"Society of Women Engineers Scholarships", org:"Society of Women Engineers",
    desc:"Scholarships for women entering an ABET-accredited engineering, computing, or technology program. High school seniors apply through the incoming-freshman application, and one application is matched to many awards. SWE membership is not required for most.",
    fields:["mechanical","civil","electrical","chemical","aerospace","cs","general"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:"03-01", timing:"Opens March 1",
    link:"https://swe.org/apply-for-a-swe-scholarship/", badges:["scholarship"], counties:"all" },

  { id:"aises-scholarship", icon:"🪶", title:"AISES Scholarships", org:"American Indian Science & Engineering Society",
    desc:"The largest scholarship provider to Indigenous students in STEM, awarding over $1 million annually. Open to enrolled citizens or descendants of recognized Tribes, Alaska Native Villages, Native Hawaiians, and Pacific Islanders headed into STEM. Requires AISES membership.",
    fields:["general","mechanical","electrical","environmental","cs"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:null, timing:"Spring deadlines",
    link:"https://aises.org/scholarships/", badges:["scholarship"], counties:"all" },

  { id:"ans-scholarship", icon:"☢️", title:"American Nuclear Society Scholarships", org:"American Nuclear Society",
    desc:"Merit- and need-based scholarships from $1,000 to $5,000 for students pursuing nuclear science and technology, including an Incoming Freshman award for graduating seniors enrolling full-time in a STEM major. One of the few scholarships aimed squarely at nuclear engineering.",
    fields:["nuclear","chemical","mechanical","electrical"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:"04-01", timing:"Apply by April 1",
    link:"https://www.ans.org/scholarships/", badges:["scholarship"], counties:"all" },

  { id:"hsf-scholarship", icon:"📚", title:"Hispanic Scholarship Fund", org:"Hispanic Scholarship Fund",
    desc:"Awards from $500 to $5,000 for Hispanic high school seniors with a 3.0+ GPA planning to enroll full-time at a four-year university; STEM majors are favored, and scholars unlock conferences and a STEM Summit. Open to U.S. citizens, permanent residents, and DACA recipients.",
    fields:["general","mechanical","electrical","cs","biomedical"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:"02-15", timing:"Apply by mid-February",
    link:"https://www.hsf.net/scholarship", badges:["scholarship"], counties:"all" },

  { id:"ffa-scholarship", icon:"🌾", title:"National FFA Scholarship Program", org:"National FFA Organization",
    desc:"Nearly $2.5 million in scholarships, with awards up to $10,000, for FFA members pursuing agriculture, ag engineering, and natural-resource fields at trade schools, two-year, or four-year colleges. Agriculture is the Central Valley's defining industry, making this especially relevant here.",
    fields:["environmental","general"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free to apply", free:true, deadline:null, timing:"Opens fall, deadlines vary",
    link:"https://www.ffa.org/participate/grants-and-scholarships/", badges:["scholarship"], counties:"all" },

  { id:"davidson-fellows", icon:"🥇", title:"Davidson Fellows Scholarship", org:"Davidson Institute",
    desc:"$10,000, $25,000, or $50,000 scholarships for students 18 and under who complete a significant, college-level project in science, technology, engineering, or mathematics. One of the most prestigious undergraduate scholarships in the country — built for serious independent research.",
    fields:["general","mechanical","civil","electrical","chemical","biomedical","aerospace","cs"], gradeMin:9, gradeMax:12, grades:"Up to age 18",
    cost:"Free to apply", free:true, deadline:"02-12", timing:"Apply by mid-February",
    link:"https://www.davidsongifted.org/gifted-programs/fellows-scholarship/", badges:["scholarship"], counties:"all" },

  { id:"ncwit-aic", icon:"🏵️", title:"NCWIT Award for Aspirations in Computing", org:"National Center for Women & IT",
    desc:"National recognition for high school women in grades 9 to 12 active in computing, with scholarship and internship opportunities, a peer network, and prizes. A strong, accessible award that strengthens any computer science or engineering application.",
    fields:["cs","electrical"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free to apply", free:true, deadline:null, timing:"Apply in fall",
    link:"https://www.aspirations.org/", badges:["scholarship"], counties:"all" },
];

/* ============================================================
   COMPETITIONS
   ============================================================ */
CVSTEM.COMPETITIONS = [
  { id:"first-robotics", icon:"🤖", title:"FIRST Robotics Competition", org:"FIRST",
    desc:"The most respected high school engineering competition in the country. Teams build full-size robots over six weeks and compete at regional and national events, with active teams near Modesto and Stockton. Starting or leading a team is one of the strongest possible engineering extracurriculars.",
    fields:["mechanical","electrical","cs","industrial","general"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Varies by team (scholarships available)", free:false, deadline:null, timing:"January-April",
    link:"https://www.firstinspires.org/robotics/frc", badges:["competition"], counties:"all" },

  { id:"science-olympiad", icon:"🧠", title:"Science Olympiad", org:"Science Olympiad Inc.",
    desc:"A team competition with 23 events spanning engineering, chemistry, biology, and physics, including build events like Wright Stuff (aircraft) and bridge and tower design. If your school has no team, starting one is a stronger application story than simply joining.",
    fields:["general","mechanical","aerospace","chemical","biomedical","civil"], gradeMin:6, gradeMax:12, grades:"6 to 12",
    cost:"Free (small registration fee)", free:true, deadline:null, timing:"Tournaments in spring",
    link:"https://www.soinc.org/", badges:["competition"], counties:"all" },

  { id:"conrad-challenge", icon:"🌍", title:"Conrad Challenge", org:"Conrad Foundation",
    desc:"A national innovation competition with categories including aerospace, health, energy, and the environment. Teams design solutions to real problems and pitch to expert judges. Free to enter and one of the best competition experiences for students planning to study engineering.",
    fields:["aerospace","environmental","biomedical","general"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:null, timing:"Apply fall, compete spring",
    link:"https://www.conradchallenge.org/", badges:["competition"], counties:"all" },

  { id:"congressional-app", icon:"📱", title:"Congressional App Challenge", org:"U.S. House of Representatives",
    desc:"Build an app and submit it to your district's member of Congress; winners are recognized in Washington, D.C. Central Valley districts historically see fewer entries than coastal areas, so your odds here are genuinely better than average.",
    fields:["cs"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:"11-01", timing:"Submit by early November",
    link:"https://www.congressionalappchallenge.us/", badges:["competition","online"], counties:"all" },

  { id:"nasa-student-launch", icon:"🚀", title:"NASA Student Launch", org:"NASA Marshall Space Flight Center",
    desc:"Teams design, build, and launch a high-powered rocket meeting NASA's technical requirements, then submit a full engineering report. This is college-level aerospace work done in high school, and it carries serious weight on an engineering application.",
    fields:["aerospace","mechanical"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free (NASA provides some funding)", free:true, deadline:null, timing:"October-April",
    link:"https://www.nasa.gov/learning-resources/nasa-student-launch/", badges:["competition"], counties:"all" },

  { id:"nasa-techrise", icon:"✈️", title:"NASA TechRise Student Challenge", org:"NASA & Future Engineers",
    desc:"A free national challenge where teams in grades 6 to 12 design and build a science or technology experiment to fly on a NASA-sponsored suborbital balloon or rocket flight. Sixty winning teams each receive $1,500, a flight spot, and technical support from NASA advisors. No prior experience needed.",
    fields:["aerospace","general","electrical","environmental"], gradeMin:6, gradeMax:12, grades:"6 to 12",
    cost:"Free", free:true, deadline:null, timing:"Opens September; entries in fall",
    link:"https://www.futureengineers.org/nasatechrise", badges:["competition"], counties:"all" },

  { id:"real-world-design", icon:"🛩️", title:"Real World Design Challenge", org:"Real World Design Challenge",
    desc:"State-based teams use professional engineering software to solve a real national challenge — past years have centered on designing precision-agriculture drones. State champions advance to Washington, D.C. A great blend of aerospace and the Valley's agricultural focus.",
    fields:["aerospace","environmental","mechanical","industrial"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:null, timing:"Fall-spring",
    link:"https://realworlddesignchallenge.org/", badges:["competition"], counties:"all" },

  { id:"future-city", icon:"🏙️", title:"Future City Competition", org:"DiscoverE",
    desc:"Middle-school teams design a city of the future using real engineering principles, from infrastructure to sustainability. If you want to mentor younger students or help start a team at a nearby middle school, this pairs naturally with civil and environmental interests.",
    fields:["civil","environmental","general","industrial"], gradeMin:6, gradeMax:8, grades:"6 to 8 (9-12 mentor)",
    cost:"Free", free:true, deadline:null, timing:"September-January",
    link:"https://futurecity.org/", badges:["competition"], counties:"all" },

  { id:"ncf-envirothon", icon:"🌲", title:"NCF-Envirothon", org:"National Conservation Foundation",
    desc:"North America's largest high school environmental competition. Teams of five tackle soils and land use, aquatic ecology, forestry, wildlife, and a rotating current issue at hands-on field stations. A perfect fit for students drawn to environmental and agricultural engineering.",
    fields:["environmental"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:null, timing:"State events spring, nationals summer",
    link:"https://envirothon.org/", badges:["competition"], counties:"all" },

  { id:"ecybermission", icon:"🛡️", title:"eCYBERMISSION", org:"U.S. Army Educational Outreach Program",
    desc:"A free, web-based STEM competition for grades 6 to 9. Teams identify a real problem in their community and solve it with the engineering design process, competing for up to $10,000 in savings bonds. Free teaching resources and mentors included.",
    fields:["general","environmental","cs","civil"], gradeMin:6, gradeMax:9, grades:"6 to 9",
    cost:"Free", free:true, deadline:null, timing:"Register fall, submit winter",
    link:"https://www.ecybermission.com/", badges:["competition","online"], counties:"all" },

  { id:"tsa-teams", icon:"📊", title:"TSA TEAMS Competition", org:"Technology Student Association",
    desc:"A themed academic challenge where teams apply engineering, math, and science to real-world problems and present their solutions. You do not need to belong to TSA to participate, making it an accessible team entry point into engineering.",
    fields:["mechanical","civil","electrical","industrial","general"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Registration fee (TSA discount)", free:false, deadline:null, timing:"Winter-spring",
    link:"https://tsaweb.org/teams", badges:["competition"], counties:"all" },

  { id:"cyberpatriot", icon:"🔐", title:"CyberPatriot", org:"Air & Space Forces Association",
    desc:"The nation's largest youth cyber-defense competition. Teams of middle and high schoolers act as new IT pros, finding and fixing cybersecurity vulnerabilities in virtual networks across online rounds. The clearest on-ramp into cybersecurity and computer engineering.",
    fields:["cs","electrical"], gradeMin:6, gradeMax:12, grades:"6 to 12",
    cost:"Registration fee (waivers available)", free:false, deadline:null, timing:"Register fall, compete winter",
    link:"https://www.uscyberpatriot.org/", badges:["competition","online"], counties:"all" },

  { id:"jshs", icon:"🔎", title:"Junior Science & Humanities Symposium", org:"U.S. Department of Defense",
    desc:"A free competition where students present original STEM research to judges for a share of more than $400,000 in scholarships and awards across regional and national events. If you have done any research, you can compete here.",
    fields:["general","mechanical","biomedical","environmental","chemical","cs"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:null, timing:"Regional events winter-spring",
    link:"https://www.jshs.org/", badges:["competition"], counties:"all" },

  { id:"hosa", icon:"🩹", title:"HOSA Future Health Professionals", org:"HOSA",
    desc:"The largest student organization for future health and biomedical professionals, with 60+ competitive events including Biomedical Laboratory Science and Biomedical Debate. Students advance from regional to state to international levels and can earn scholarships. Ideal for biomedical engineering interest.",
    fields:["biomedical"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Membership fee", free:false, deadline:null, timing:"Regional/state spring",
    link:"https://hosa.org/", badges:["competition"], counties:"all" },

  { id:"regeneron-sts", icon:"🧬", title:"Regeneron Science Talent Search", org:"Society for Science",
    desc:"The oldest and most prestigious pre-college science competition in the United States. If you have done independent or mentored research, you can submit it here. Even reaching the finalist stage regularly appears in top-college admission profiles.",
    fields:["general","biomedical","chemical","materials","electrical"], gradeMin:12, gradeMax:12, grades:"12",
    cost:"Free", free:true, deadline:"11-01", timing:"Apply in fall of senior year",
    link:"https://www.societyforscience.org/regeneron-sts/", badges:["competition"], counties:"all" },

  { id:"aiaa-design", icon:"⚙️", title:"AIAA Foundation Student Competitions", org:"American Institute of Aeronautics & Astronautics",
    desc:"The professional body for aerospace engineers runs design and research competitions open to students. Submitting work to a real aerospace organization tells admissions readers your interest in the field runs deeper than a transcript line.",
    fields:["aerospace"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free", free:true, deadline:null, timing:"Various deadlines",
    link:"https://www.aiaa.org/get-involved/students-educators", badges:["competition"], counties:"all" },

  { id:"lemelson-inventeams", icon:"💡", title:"Lemelson-MIT InvenTeams", org:"Lemelson-MIT Program",
    desc:"Teams of students, a teacher, and community mentors win grants of up to $7,500 to invent a technological solution to a real problem of their choosing over a school year, with MIT support. Pure invention and engineering — a standout team project.",
    fields:["general","mechanical","electrical","biomedical","materials"], gradeMin:9, gradeMax:12, grades:"9 to 12",
    cost:"Free (grant-funded)", free:true, deadline:null, timing:"Apply spring for next year",
    link:"https://lemelson.mit.edu/inventeams", badges:["competition"], counties:"all" },
];

/* ============================================================
   TIPS (About page)
   ============================================================ */
CVSTEM.TIPS = [
  { num:"01", title:"Depth beats breadth", text:"One program where you actually led something beats five where you just showed up. Admissions officers look for sustained commitment and genuine impact, not a long roster of club memberships with nothing behind them." },
  { num:"02", title:"Apply to the things that seem out of reach", text:"Programs like COSMOS, MITES, and SSP accept a small share of applicants. But Central Valley students are underrepresented in every one of them, and geographic diversity works in your favor. You will not know until you apply." },
  { num:"03", title:"Cold email a professor", text:"UC Merced is 45 minutes from Modesto, and Fresno State and Sac State are close too. Write to a faculty member and ask if you can help in their lab over the summer. Most high school students never try this. It works more often than you would expect." },
  { num:"04", title:"Track everything with numbers from day one", text:"\"Taught three workshops to 40 students\" is a statement. \"Volunteered at STEM events\" is not. Write down attendance counts, hours, and outcomes from your very first session. You will be grateful come October of senior year." },
  { num:"05", title:"Start something rather than just join something", text:"A program you built tells a story. A club you joined does not, unless you eventually led it. Starting a workshop series, a Science Olympiad team, or a public GitHub project puts you in a different category of applicant." },
  { num:"06", title:"Your location is an advantage", text:"The Central Valley is underrepresented at top universities, and UC schools know it. Frame your background honestly: a student who grew up in an agricultural region with limited STEM access and built something anyway. That is your story." },
];

/* ============================================================
   Unified list for the Explore page — adds a `type` to every record.
   ============================================================ */
CVSTEM.ALL = [
  ...CVSTEM.PROGRAMS.map(x => ({ ...x, type: "Program" })),
  ...CVSTEM.SCHOLARSHIPS.map(x => ({ ...x, type: "Scholarship" })),
  ...CVSTEM.COMPETITIONS.map(x => ({ ...x, type: "Competition" })),
];

/* Quick totals other scripts can read without recomputing. */
CVSTEM.COUNTS = {
  total:         CVSTEM.ALL.length,
  programs:      CVSTEM.PROGRAMS.length,
  scholarships:  CVSTEM.SCHOLARSHIPS.length,
  competitions:  CVSTEM.COMPETITIONS.length,
  fields:        CVSTEM.FIELDS.filter(f => f.key !== "general").length, // 11 engineering disciplines
  counties:      CVSTEM.COUNTIES.length,
};
