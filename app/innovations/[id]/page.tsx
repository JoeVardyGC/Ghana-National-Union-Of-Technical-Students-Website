import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { InnovationItem } from '@/components/InnovationsClient';
import { 
  Building2, 
  User, 
  ArrowLeft, 
  Zap, 
  Calendar, 
  Clock, 
  Tag, 
  ChevronRight, 
  ChevronLeft,
  Play,
  ExternalLink,
  Images
} from 'lucide-react';
import ShareButtons from './ShareButtons';
import { ReadingProgressBar } from '@/components/ArticleDetailClient';

export const revalidate = 60;

const DEFAULT_INNOVATIONS: (InnovationItem & { images?: string[] })[] = [
  {
    id: 7,
    title: "Green Campus Energy & Waste Concept",
    description: "The University is confronted with unique challenges as the campus has grown considerably over the past several years, growing from 4,000 students to over 10,000 students in recent times. The population is expected to increase further with the conversion from polytechnic to technical university. This growth has necessitated the expansion of campus facilities and the construction of new buildings, thereby increasing energy demand and waste generation on campus.\n\nThe university presently consumes about 10 GWh of electricity annually. Paying electricity bills has always been a major problem, inability to pay sometimes results in the university being disconnected by the power company. Besides, the university also experiences frequent power outages due to unreliable supply from the national grid.\n\nThere is no data on the volume of waste generated on KsTU campus presently, however the indiscriminate disposal of waste around campus and in lecture halls, heaps of solid waste left unattended to for several days, inadequate and inappropriate waste collection bins, are evidence of waste management challenges on campus.\n\nThis project introduces an integrated solar micro-grid and campus organic waste-to-energy digester system to generate clean power locally while streamlining waste management across lecture halls and hostels.",
    project_image: "uploads/innovations/694b47bd1b626.png",
    video_url: "https://kstu.edu.gh/about-us/green-campus-concept",
    institution: "Kumasi Technical University",
    student_name: "Kumasi Technical University",
    status: "approved",
    created_at: "Dec 22, 2025",
    category: "Renewable Energy",
    upvotes: 184,
    images: ["uploads/innovations/694b47bd1b626.png", "uploads/innovations/694b62083312a.png"]
  },
  {
    id: 8,
    title: "Intelligent Solar Baby Incubator",
    description: "This project was developed for the 2025 Energy Commission Senior High School Renewable Energy Challenge. It features a baby incubator that runs entirely on solar power, incorporating intelligent sensors to monitor temperature and humidity. It aims to solve the problem of power instability in rural Ghanaian health facilities, ensuring consistent life-support for neonates.",
    project_image: "uploads/innovations/694b62083312a.png",
    video_url: "https://youtu.be/0-SVwLbonAE?si=BVGionni-dN_KDB7",
    institution: "Dabokpa Technical Institute",
    student_name: "Dabokpa Engineering Team",
    status: "approved",
    created_at: "Dec 22, 2025",
    category: "Medical Technology",
    upvotes: 215,
    images: ["uploads/innovations/694b62083312a.png"]
  },
  {
    id: 9,
    title: "Automated Cassava Processing Machine",
    description: "An automated electro-mechanical cassava peeling and grating machine engineered by HND Mechanical Engineering students. Designed to assist smallholder farmers in rural Ghana, the machine reduces cassava processing time by 85% while minimizing post-harvest food spoilage.\n\nPowered by a hybrid electric and diesel motor, it processes up to 500kg of cassava per hour with clean peeling efficiency.",
    project_image: "uploads/innovations/cassava_machine.jpg",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    institution: "Accra Technical University",
    student_name: "Kofi Owusu & Team",
    status: "approved",
    created_at: "Jan 15, 2026",
    category: "Mechanical Engineering",
    upvotes: 142,
    images: ["uploads/innovations/cassava_machine.jpg"]
  },
  {
    id: 10,
    title: "IoT Smart Irrigation System",
    description: "An IoT-enabled precision farming system developed for urban and peri-urban vegetable farmers. Soil moisture, NPK nutrient levels, and temperature sensors stream live telemetry data to a mobile app via GSM/LoRa.\n\nAutomated water valves trigger drip irrigation only when soil moisture drops below critical thresholds, conserving water usage by 40%.",
    project_image: "uploads/innovations/smart_irrigation.jpg",
    video_url: "",
    institution: "Takoradi Technical University",
    student_name: "Abena Mensah",
    status: "approved",
    created_at: "Feb 02, 2026",
    category: "AgTech & Automation",
    upvotes: 98,
    images: ["uploads/innovations/smart_irrigation.jpg"]
  },
  {
    id: 11,
    title: "Solar Portable Cold Storage Unit",
    description: "A mobile, thermal-insulated cold storage box equipped with solar panels and phase-change material (PCM) battery storage. Designed for coastal fishmongers and tomato vendors to preserve perishable produce during transit to central markets.\n\nMaintains temperatures between 2°C to 8°C for up to 18 hours without grid connectivity.",
    project_image: "uploads/innovations/solar_cold_storage.jpg",
    video_url: "",
    institution: "Cape Coast Technical University",
    student_name: "Emmanuel Addo",
    status: "approved",
    created_at: "Feb 10, 2026",
    category: "Renewable Energy",
    upvotes: 126,
    images: ["uploads/innovations/solar_cold_storage.jpg"]
  },
  {
    id: 12,
    title: "AI TVET Skill Matching Platform",
    description: "An artificial intelligence web application connecting certified technical university graduates directly with industrial engineering firms across West Africa.\n\nUses skill-matrix matching algorithms to evaluate practical workshop credentials, portfolio projects, and CTVET certifications.",
    project_image: "uploads/innovations/tvet_ai_app.jpg",
    video_url: "",
    institution: "Koforidua Technical University",
    student_name: "Kwaku Yeboah",
    status: "approved",
    created_at: "Feb 14, 2026",
    category: "Software & AI",
    upvotes: 167,
    images: ["uploads/innovations/tvet_ai_app.jpg"]
  },
  {
    id: 13,
    title: "High-Tech Hydroponic Vertical Farm",
    description: "A closed-loop automated hydroponic vertical farming module designed by Agricultural Engineering students. Features automated pH balancing, nutrient dosing pumps, and full-spectrum LED grow lights for high-density urban vegetable production.",
    project_image: "uploads/innovations/hydroponic_farm.jpg",
    video_url: "",
    institution: "Sunyani Technical University",
    student_name: "Yaa Asantewaa & Team",
    status: "approved",
    created_at: "Feb 16, 2026",
    category: "AgTech & Automation",
    upvotes: 189,
    images: ["uploads/innovations/hydroponic_farm.jpg"]
  },
  {
    id: 14,
    title: "Precision Agricultural Drone Sprayer",
    description: "A custom hexacopter drone engineered for precision fertilizer application and crop disease detection. Equipped with multi-spectral cameras and GPS waypoint navigation to cover 5 acres of cropland per hour.",
    project_image: "uploads/innovations/drone_sprayer.jpg",
    video_url: "",
    institution: "Tamale Technical University",
    student_name: "Ibrahim Fuseini",
    status: "approved",
    created_at: "Feb 17, 2026",
    category: "Robotics & Automation",
    upvotes: 204,
    images: ["uploads/innovations/drone_sprayer.jpg"]
  },
  {
    id: 15,
    title: "3D-Printed Bionic Prosthetic Hand",
    description: "An affordable 3D-printed prosthetic bionic hand utilizing electromyographic (EMG) muscle sensors to detect forearm muscle twitches. Designed for amputees in West Africa at a fraction of commercial costs.",
    project_image: "uploads/innovations/prosthetic_hand.jpg",
    video_url: "",
    institution: "Ho Technical University",
    student_name: "Selorm Kpodo",
    status: "approved",
    created_at: "Feb 18, 2026",
    category: "Medical Technology",
    upvotes: 230,
    images: ["uploads/innovations/prosthetic_hand.jpg"]
  }
];

function extractYouTubeID(url?: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getImagePath(img?: string) {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('uploads/')) return `/${img}`;
  return `/uploads/innovations/${img}`;
}

function getReadTime(text: string) {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

// Multi-Image Parser (JSON array, comma-separated string, or array)
function parseProjectImages(rawMain?: string, rawImages?: any): string[] {
  const images: string[] = [];

  const mainPath = getImagePath(rawMain);
  if (mainPath) images.push(mainPath);

  if (rawImages) {
    let list: string[] = [];
    if (Array.isArray(rawImages)) {
      list = rawImages;
    } else if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages);
        if (Array.isArray(parsed)) list = parsed;
      } catch {
        list = rawImages.split(',').map((s) => s.trim());
      }
    }

    list.forEach((img) => {
      const p = getImagePath(img);
      if (p && !images.includes(p)) {
        images.push(p);
      }
    });
  }

  return images;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const idNum = Number(resolvedParams.id);
  
  let project: InnovationItem | null = null;
  try {
    const rows = await query<any>('SELECT * FROM innovations WHERE id = ?', [idNum]);
    if (rows && rows.length > 0) {
      project = rows[0];
    }
  } catch {}

  if (!project) {
    project = DEFAULT_INNOVATIONS.find((item) => item.id === idNum) || null;
  }

  const title = project ? `${project.title} | GNUTS Innovative Projects` : 'Project Detail | GNUTS';
  const description = project?.description?.slice(0, 160).replace(/[\r\n]+/g, ' ') || 'Student innovative project showcased by Ghana National Union of Technical Students.';
  const image = project?.project_image ? (project.project_image.startsWith('http') ? project.project_image : `/${project.project_image.replace(/^\/+/, '')}`) : 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function InnovationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idNum = Number(resolvedParams.id);

  let project: (InnovationItem & { images?: any }) | null = null;
  let allProjects: InnovationItem[] = [];

  try {
    const rows = await query<any>("SELECT * FROM innovations WHERE status = 'approved' ORDER BY created_at DESC");
    if (rows && rows.length > 0) {
      allProjects = rows.map((r: any) => ({
        id: r.id,
        title: r.title || '',
        description: r.description || '',
        project_image: r.project_image || '',
        video_url: r.video_url || '',
        institution: r.institution || '',
        student_name: r.student_name || '',
        status: r.status || 'approved',
        created_at: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '2026-02-14',
        category: r.category || 'Renewable Energy',
        upvotes: r.upvotes || 150,
        images: r.images || null,
      }));
      project = allProjects.find((item) => item.id === idNum) || null;
    }
  } catch (error) {
    console.error('Error fetching project detail:', error);
  }

  if (!project) {
    allProjects = DEFAULT_INNOVATIONS;
    project = DEFAULT_INNOVATIONS.find((item) => item.id === idNum) || null;
  }

  if (!project) {
    notFound();
  }

  const otherProjects = allProjects.filter((item) => item.id !== project!.id).slice(0, 4);
  const currentIndex = allProjects.findIndex((item) => item.id === project!.id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  const projectImages = parseProjectImages(project.project_image, project.images);
  const primaryImg = projectImages.length > 0 ? projectImages[0] : null;
  const youtubeId = extractYouTubeID(project.video_url);
  const categoryTag = project.category || 'Renewable Energy';

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-sans">
      {/* Sticky Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Editorial Page Hero Header */}
      <section className="relative text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b-4 border-[#D9A000] bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg')` }}
        />
        <div className="absolute inset-0 bg-[#014900]/55 backdrop-brightness-90" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300 mb-6 font-medium">
            <Link href="/" className="hover:text-[#D9A000] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/innovations" className="hover:text-[#D9A000] transition-colors">Innovative Projects</Link>
            <span>/</span>
            <span className="text-[#D9A000] font-bold truncate max-w-[200px] sm:max-w-xs">{project.title}</span>
          </div>

          <Link
            href="/innovations"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white/90 hover:text-[#D9A000] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Projects</span>
          </Link>

          {/* Discipline Badge Tag */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3.5 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider bg-[#D9A000] text-white inline-block shadow-sm">
              {categoryTag}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4 drop-shadow-md">
            {project.title}
          </h1>

          {/* Author / Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-200 pt-5 border-t border-white/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#D9A000] text-[#014900] flex items-center justify-center font-extrabold text-sm shadow-md">
                {(project.student_name || project.institution || 'G').charAt(0)}
              </div>
              <div>
                <span className="font-bold block text-white">{project.student_name || 'Student Developer'}</span>
                <span className="text-[11px] text-gray-300">{project.institution || 'Technical Institution'}</span>
              </div>
            </div>

            {project.created_at && (
              <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                <Calendar className="w-4 h-4 text-[#D9A000]" />
                <span>{project.created_at}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-gray-300 font-medium">
              <Clock className="w-4 h-4 text-[#D9A000]" />
              <span>{getReadTime(project.description)} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Layout */}
      <section className="py-10 sm:py-16 flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Main Project Column (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-200 space-y-8">
              
              {/* Primary Poster Image & Multi-Picture Gallery Container */}
              {projectImages.length > 0 && (
                <div className="space-y-4">
                  {/* Primary Image Poster */}
                  <div id="article-main-image" className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 max-h-[550px] flex items-center justify-center relative shadow-sm">
                    <img
                      src={primaryImg!}
                      alt={project.title}
                      className="w-full h-auto max-h-[550px] object-cover"
                    />
                  </div>

                  {/* Multi-Picture Gallery Grid (If 2 or more pictures exist!) */}
                  {projectImages.length > 1 && (
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <Images className="w-4 h-4 text-[#014900]" />
                        <span>PROJECT GALLERY ({projectImages.length} PHOTOS)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {projectImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="h-32 sm:h-36 bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 group relative shadow-xs"
                          >
                            <img
                              src={img}
                              alt={`${project.title} - Photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Project Description Text */}
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-5 text-sm sm:text-base font-medium font-sans">
                {project.description.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* YouTube Video Demonstration */}
              {youtubeId && (
                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#014900] uppercase tracking-wider flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#D9A000]" />
                    <span>Project Demonstration Video</span>
                  </h3>
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-200">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={project.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* External Project Link */}
              {project.video_url && !youtubeId && (
                <div className="pt-4 border-t border-gray-100">
                  <a
                    href={project.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#014900] hover:text-[#D9A000] underline"
                  >
                    <span>Visit Official Project Resource</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Hashtags Bar */}
              <div className="pt-6 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-[#014900]" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">TAGS:</span>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-[#014900] bg-[#f8f9fa] px-3 py-1 rounded-full border border-gray-200">
                    #GNUTS
                  </span>
                  <span className="text-xs font-bold text-[#014900] bg-[#f8f9fa] px-3 py-1 rounded-full border border-gray-200">
                    #ChooseTVETFirst
                  </span>
                  <span className="text-xs font-bold text-[#014900] bg-[#f8f9fa] px-3 py-1 rounded-full border border-gray-200">
                    #{categoryTag.replace(/\s+/g, '')}
                  </span>
                </div>
              </div>

              {/* Social Share Toolbar */}
              <ShareButtons title={project.title} id={project.id} />

              {/* Next / Previous Project Navigation */}
              <div className="pt-8 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevProject ? (
                  <Link
                    href={`/innovations/${prevProject.id}`}
                    className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group space-y-1 block shadow-xs"
                  >
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <ChevronLeft className="w-3.5 h-3.5 text-[#014900]" />
                      <span>Previous Project</span>
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-[#014900] line-clamp-1 transition-colors">
                      {prevProject.title}
                    </div>
                  </Link>
                ) : <div />}

                {nextProject ? (
                  <Link
                    href={`/innovations/${nextProject.id}`}
                    className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all group space-y-1 text-right block ml-auto w-full shadow-xs"
                  >
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-end gap-1">
                      <span>Next Project</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#014900]" />
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-[#014900] line-clamp-1 transition-colors">
                      {nextProject.title}
                    </div>
                  </Link>
                ) : <div />}
              </div>

            </div>

            {/* Sidebar Column (4 Cols) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Recent Innovative Projects Widget */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 border-l-4 border-l-[#014900]">
                <h3 className="text-lg font-extrabold text-[#014900] pb-3 mb-5 border-b-2 border-[#D9A000]">
                  More Projects
                </h3>

                <div className="space-y-5">
                  {otherProjects.map((item) => {
                    const itemImg = getImagePath(item.project_image);
                    return (
                      <Link
                        key={item.id}
                        href={`/innovations/${item.id}`}
                        className="group flex items-start gap-3.5 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-900 shrink-0 border border-gray-200 flex items-center justify-center">
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Zap className="w-6 h-6 text-white/40" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 group-hover:text-[#014900] transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                          {item.institution && (
                            <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 truncate">
                              <Building2 className="w-3 h-3 text-[#014900] shrink-0" />
                              <span className="truncate">{item.institution}</span>
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Quick Union Advocacy Box */}
              <div className="bg-[#014900] text-white p-6 sm:p-7 rounded-3xl shadow-sm border-l-4 border-l-[#D9A000] space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#D9A000]">
                  GNUTS INNOVATION LAB
                </div>
                <h4 className="text-lg font-extrabold leading-snug">
                  Have a Technical Project to Submit?
                </h4>
                <p className="text-xs text-gray-100 leading-relaxed">
                  Submit your engineering prototype, robotics build, or TVET research project to the GNUTS Secretariat for national showcase.
                </p>
                <div className="pt-2">
                  <Link
                    href="/innovations"
                    className="inline-block px-5 py-2.5 bg-[#D9A000] hover:bg-yellow-600 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-sm"
                  >
                    Submit Project →
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
