import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>GNUTS Project Specification Sheet #${id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111827; }
          .header { border-bottom: 4px solid #014900; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-title { font-size: 24px; font-weight: 800; color: #014900; }
          .gold-pill { display: inline-block; background: #D9A000; color: white; padding: 4px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; }
          h1 { font-size: 28px; text-transform: uppercase; margin-top: 5px; margin-bottom: 10px; }
          .meta { font-size: 14px; color: #4B5563; margin-bottom: 20px; font-weight: 600; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: 800; color: #014900; text-transform: uppercase; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px; margin-bottom: 12px; }
          .content { font-size: 15px; line-height: 1.6; color: #374151; }
          .footer { margin-top: 50px; pt-20 border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #9CA3AF; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="gold-pill">GNUTS TECHNICAL INNOVATION LAB</div>
          <div class="logo-title">Ghana National Union of Technical Students</div>
        </div>

        <div class="section">
          <h1>Project Specification & Research Brief #${id}</h1>
          <div class="meta">
            Official Technical Documentation | Verified by GNUTS Secretariat
          </div>
        </div>

        <div class="section">
          <div class="section-title">Technical Project Abstract</div>
          <div class="content">
            This technical document provides the verified specifications, component architecture, and student development brief for Project #${id}. Engineering student teams at Ghana Technical Universities develop these prototypes under the supervision of faculty advisors and industry mentors.
          </div>
        </div>

        <div class="section">
          <div class="section-title">Compliance & Standards</div>
          <div class="content">
            - CTVET Occupational Standards Certification: Level 5 Verified<br/>
            - Renewable Energy & Industrial Safety Protocols: Compliant<br/>
            - Open Technical Repository ID: GNUTS-TECH-2026-${id}
          </div>
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Ghana National Union of Technical Students (GNUTS). All Rights Reserved.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
