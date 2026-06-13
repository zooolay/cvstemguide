/* ============================================================
   CV STEM Guide — Data
   Single source of truth for all resources. Loaded as a plain
   script (no build step); attaches to the global `CVSTEM`.
   To add a resource: open an issue or append an object below.
   ============================================================ */
window.CVSTEM = window.CVSTEM || {};

CVSTEM.COUNTIES = ["Butte","Colusa","Fresno","Glenn","Kern","Kings","Madera","Merced","Placer","Sacramento","San Joaquin","Shasta","Stanislaus","Sutter","Tehama","Tulare","Yolo","Yuba"];

CVSTEM.PROGRAMS = [
  { icon:"🚀", title:"COSMOS — California Summer School for Math and Science", org:"University of California System",
    desc:"A four-week residential program at UC Davis, UC Merced, UCLA, UC Irvine, UC San Diego, or UC Santa Cruz. Students work directly with UC faculty on real STEM research. It is one of California's most respected pre-college programs and a genuinely transformative experience for anyone serious about STEM.",
    grades:"8 to 12", cost:"Free with need-based aid available", timing:"Summer, July through August",
    tags:["free","residential","engineering","aerospace"], link:"https://cosmos-ucop.ucdavis.edu/", badges:["free","residential"], counties:"all" },
  { icon:"✈️", title:"NASA High School Aerospace Scholars", org:"NASA Johnson Space Center",
    desc:"A free online course where top participants earn an in-person invitation to NASA's Johnson Space Center. Students complete real aerospace engineering design challenges guided by NASA mentors throughout. One of the most respected aerospace-specific programs available to any high schooler in the country.",
    grades:"11", cost:"Free", timing:"Fall online, Spring on-site",
    tags:["free","aerospace","online","engineering"], link:"https://www.nasa.gov/learning-resources/high-school-aerospace-scholars/", badges:["free","online"], counties:"all" },
  { icon:"🌌", title:"Summer Science Program — Astrophysics", org:"Summer Science Program",
    desc:"A five-week residential program where student teams actually calculate asteroid orbits using real telescope observations. Need-based aid frequently brings the cost down to zero. It is one of the most selective and well-regarded pre-college STEM experiences in the United States.",
    grades:"10 to 12", cost:"Up to $9,800 — need-based aid often brings it to zero", timing:"Late June through Early August",
    tags:["free","residential","aerospace"], link:"https://summerscience.org/", badges:["residential"], counties:"all" },
  { icon:"🛩️", title:"UCLA Summer Springboard — Aerospace Engineering", org:"UCLA / Springboard",
    desc:"A hands-on aerospace engineering program held on UCLA's campus. You work alongside current faculty and students on real projects. If UCLA is where you want to go, this is one of the best ways to build familiarity with the school long before you apply.",
    grades:"9 to 12", cost:"Paid, some financial aid available", timing:"Summer",
    tags:["aerospace","engineering","residential"], link:"https://summerspringboard.com/teen-programs/aerospace-engineering-at-ucla/", badges:["residential","paid"], counties:"all" },
  { icon:"🤖", title:"FIRST Robotics Competition", org:"FIRST Robotics",
    desc:"The most respected high school engineering competition in the country. Teams build full-size robots over six weeks and compete at regional and national events. Modesto and Stockton both have active teams nearby. Starting or leading a team is one of the strongest possible extracurriculars you can have for any engineering program.",
    grades:"9 to 12", cost:"Varies by team, scholarships available", timing:"January through April",
    tags:["engineering","competition"], link:"https://www.firstinspires.org/robotics/frc", badges:["competition"], counties:"all" },
  { icon:"🏫", title:"UC Merced Summer Research via Cold Email", org:"UC Merced — MAE Department",
    desc:"There is no formal application. You write directly to professors and ask to help in their lab over summer. UC Merced is 45 minutes from Modesto. Professors like Dr. Francesco Danzi who works on UAV design and Prof. YangQuan Chen who studies drone systems have taken on motivated students before. Self-initiated research like this is one of the most impressive things you can show a college.",
    grades:"10 to 12", cost:"Free, unpaid volunteer research", timing:"Summer",
    tags:["free","aerospace","engineering","online"], link:"https://mae.ucmerced.edu/faculty", badges:["free"], counties:["Stanislaus","San Joaquin","Merced","Fresno","Madera","Kings","Tulare"] },
  { icon:"🔭", title:"Stanford Medical Youth Science Program", org:"Stanford University",
    desc:"A free five-week residential program for low-income and underrepresented high school juniors from Northern and Central California. Participants receive intensive science training and one-on-one mentorship from working medical professionals. Central Valley students are genuinely recruited for this one.",
    grades:"11", cost:"Free", timing:"Summer",
    tags:["free","residential"], link:"https://smysp.stanford.edu/", badges:["free","residential"], counties:["Fresno","Kern","Kings","Madera","Merced","San Joaquin","Stanislaus","Tulare"] },
  { icon:"💡", title:"Science Olympiad", org:"Science Olympiad Inc.",
    desc:"A team competition with 23 different events covering engineering, science, and technology. Aerospace events include Wright Stuff for plane design and Scrambler for engineering challenges. If your school does not have a team yet, starting one is actually a stronger application story than simply joining an existing one.",
    grades:"6 to 12", cost:"Free with a small registration fee", timing:"Year-round, tournaments in spring",
    tags:["free","engineering","aerospace","competition"], link:"https://www.soinc.org/", badges:["free","competition"], counties:"all" },
  { icon:"🧪", title:"Fresno State STEM Outreach Programs", org:"California State University, Fresno",
    desc:"CSU Fresno runs several STEM outreach programs for Central Valley high schoolers including science academies, dual enrollment courses, and research exposure for students who want a head start. Check their outreach office directly for what is running in the current season.",
    grades:"9 to 12", cost:"Free to low cost", timing:"Summer and year-round",
    tags:["free","engineering"], link:"https://www.fresnostate.edu/", badges:["free"], counties:["Fresno","Madera","Kings","Tulare","Merced"] },
  { icon:"🛸", title:"Embry-Riddle Aeronautical University Summer Academy", org:"Embry-Riddle Aeronautical University",
    desc:"Week-long camps in aviation, aerospace engineering, robotics, and space science at campuses in Daytona Beach and Prescott. Embry-Riddle is one of the most well-known aerospace universities in the country. Attending here sends a clear signal that your interest in the field goes beyond just a class you took.",
    grades:"9 to 12", cost:"$1,200 to $2,000 per week", timing:"June through July",
    tags:["aerospace","residential","engineering"], link:"https://daytonabeach.erau.edu/academics/summer-academy", badges:["residential","paid"], counties:"all" },
];

CVSTEM.SCHOLARSHIPS = [
  { icon:"⚡", title:"Edison Scholars Program", org:"Edison International",
    desc:"$50,000 scholarships for 30 California high school seniors pursuing STEM at a four-year university. Specifically designed for students from underserved communities and Central Valley students have won this before. Requires a 3.0 GPA and demonstrated financial need.",
    grades:"12", cost:"Free to apply", timing:"Apply in fall of senior year",
    tags:["scholarship"], link:"https://www.edison.com/community/edison-scholars", badges:["scholarship","free"], counties:["Fresno","Kern","Kings","Madera","Merced","San Joaquin","Stanislaus","Tulare"] },
  { icon:"🌻", title:"Central Valley Community Foundation Scholarships", org:"Central Valley Community Foundation",
    desc:"Nearly 240 scholarships awarded every year totaling close to $3 million since 2017, all serving students across the region. Multiple awards are focused on STEM fields. Based in Fresno with reach across the entire Valley.",
    grades:"12", cost:"Free to apply", timing:"Apply in spring of senior year",
    tags:["scholarship"], link:"https://www.centralvalleycf.org/scholarships", badges:["scholarship","free"], counties:["Fresno","Madera","Kings","Tulare","Merced","Kern"] },
  { icon:"🤝", title:"Stanislaus Community Foundation Scholarships", org:"Stanislaus Community Foundation",
    desc:"Multiple scholarships for Stanislaus County students, including STEM-specific awards. The Beyer High School STEM scholarship targets students going directly into STEM degrees. General awards for Modesto and Turlock area students are also available to apply for.",
    grades:"12", cost:"Free to apply", timing:"Spring of senior year",
    tags:["scholarship"], link:"https://www.stanislauscf.org/scholarships", badges:["scholarship","free"], counties:["Stanislaus"] },
  { icon:"🔬", title:"San Joaquin Community Foundation Scholarships", org:"San Joaquin Community Foundation",
    desc:"Multiple scholarships for San Joaquin County students including a STEM-specific fund honoring Dr. Grimes, which supports Manteca Unified seniors headed toward STEM or medical fields. Strong focus on underrepresented students throughout the county.",
    grades:"12", cost:"Free to apply", timing:"Spring of senior year",
    tags:["scholarship"], link:"https://sanjoaquincf.org/scholarships/", badges:["scholarship","free"], counties:["San Joaquin"] },
  { icon:"🏆", title:"Central Valley Scholars", org:"Central Valley Scholars",
    desc:"$30,000 in scholarships set aside specifically for Central Valley students. Focused on recognizing local talent and supporting students who may not have had the same access to college prep resources that students in other parts of the state take for granted. Check the website for the current application cycle.",
    grades:"12", cost:"Free to apply", timing:"Check website for deadlines",
    tags:["scholarship"], link:"https://www.centralvalleyscholars.org/scholarships", badges:["scholarship","free"], counties:"all" },
];

CVSTEM.COMPETITIONS = [
  { icon:"🌍", title:"Conrad Challenge", org:"Conrad Foundation",
    desc:"A national innovation competition with a dedicated Aerospace and Aviation category. Teams of two to five students design solutions to real problems and pitch to judges that include working NASA engineers. Free to enter and one of the best competition experiences specifically for students planning to study aerospace.",
    grades:"9 to 12", cost:"Free", timing:"Apply in fall, compete in spring",
    tags:["free","aerospace","competition"], link:"https://www.conradchallenge.org/", badges:["free","competition"], counties:"all" },
  { icon:"📱", title:"Congressional App Challenge", org:"U.S. House of Representatives",
    desc:"Build an app and submit it to your district's U.S. Congressman. Winners are recognized in Washington D.C. Central Valley districts historically see fewer entries than coastal areas, so your chances here are genuinely better than average.",
    grades:"9 to 12", cost:"Free", timing:"Submit by November 1",
    tags:["free","competition","online"], link:"https://www.congressionalappchallenge.us/", badges:["free","competition"], counties:"all" },
  { icon:"🚀", title:"NASA Student Launch Initiative", org:"NASA Marshall Space Flight Center",
    desc:"Teams design, build, and actually launch a high-powered rocket that meets NASA's technical requirements, then submit a full engineering report. This is college-level aerospace work done while still in high school. It runs from October through April and carries serious weight on any engineering application.",
    grades:"9 to 12", cost:"Free — NASA provides some funding", timing:"October through April",
    tags:["free","aerospace","engineering","competition"], link:"https://www.nasa.gov/learning-resources/nasa-student-launch/", badges:["free","competition"], counties:"all" },
  { icon:"🧬", title:"Regeneron Science Talent Search", org:"Society for Science",
    desc:"The oldest and most prestigious pre-college science competition in the United States. If you have done any research through a professor or independently, you can submit it here. Even reaching the finalist stage regularly appears in Ivy League admission profiles.",
    grades:"12", cost:"Free", timing:"Apply in fall of senior year",
    tags:["free","competition"], link:"https://www.societyforscience.org/regeneron-sts/", badges:["free","competition"], counties:"all" },
  { icon:"⚙️", title:"AIAA Student Design Competition", org:"American Institute of Aeronautics and Astronautics",
    desc:"The professional organization for aerospace engineers runs competitions specifically for high school students. Submitting a design report to a real aerospace professional body tells admissions readers that your interest in the field is deeper than anything that shows up on a transcript.",
    grades:"9 to 12", cost:"Free", timing:"Various deadlines throughout the year",
    tags:["free","aerospace","competition"], link:"https://www.aiaa.org/get-involved/students-educators/Design-Competitions", badges:["free","competition"], counties:"all" },
  { icon:"🏙️", title:"Future City Competition", org:"DiscoverE / Future City",
    desc:"Middle school teams design a city of the future using real engineering principles. If you want to mentor younger students or help start a team at a nearby middle school, this pairs naturally with any community STEM outreach work you are already doing.",
    grades:"6 to 8 as participant, 9 to 12 as mentor", cost:"Free", timing:"September through January",
    tags:["free","engineering","competition"], link:"https://futurecity.org/", badges:["free","competition"], counties:"all" },
];

CVSTEM.TIPS = [
  { num:"01", title:"Depth beats breadth", text:"One program where you actually led something beats five where you just showed up. Admissions officers at schools like UCLA are looking for sustained commitment and genuine impact, not a long roster of club memberships with nothing behind them." },
  { num:"02", title:"Apply to the things that seem out of reach", text:"Programs like COSMOS, NASA Scholars, and SSP accept fewer than 15 percent of applicants. But Central Valley students are underrepresented in every single one of them. Geographic diversity works in your favor here. You will not know until you apply." },
  { num:"03", title:"Cold email a professor", text:"UC Merced is 45 minutes from Modesto. Write to a faculty member in the MAE department and ask if you can help in their lab over summer. Most high school students never try this. It works more often than you would expect." },
  { num:"04", title:"Track everything with numbers from day one", text:"Taught three workshops to 40 students is a statement. Volunteered at STEM events is not. Write down attendance counts, hours, and outcomes from your very first session. You will be grateful for it come October of senior year." },
  { num:"05", title:"Start something rather than just join something", text:"A program you built tells a story. A club you joined does not, unless you eventually led it. Starting a STEM workshop series, a Science Olympiad team, or even a public GitHub project puts you in a genuinely different category of applicant." },
  { num:"06", title:"Your location is actually an advantage", text:"The Central Valley is underrepresented at top universities and UC schools know it. Frame your background as a student who grew up in an agricultural region with limited STEM access and built something anyway. That is not a weakness. That is your story." },
];

/* Unified list for the Explore page — adds a `type` to every record. */
CVSTEM.ALL = [
  ...CVSTEM.PROGRAMS.map(x => ({ ...x, type: "Program" })),
  ...CVSTEM.SCHOLARSHIPS.map(x => ({ ...x, type: "Scholarship" })),
  ...CVSTEM.COMPETITIONS.map(x => ({ ...x, type: "Competition" })),
];
