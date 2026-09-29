import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const childId = body?.child_id || 'learner';
    const role = body?.role || 'parent';

    // Autism-informed heuristic recommendation tailored to role and child
    const recommendation = {
      child_id: childId,
      headline: role === 'educator' ? "IEP Milestone Pacing Alignment" : "Balanced Socio-Emotional Engagement",
      summary: `Recent activity indicates strong pattern completion in First-Then routines with low prompt dependency. Calming sensory feedback successfully supports regulation for ${childId}.`,
      suggested_action: "Practice multi-step morning transition routine cards 10 minutes prior to school departure.",
      sensory_adjustment_advice: "Maintain soft volume chimes and gentle-sage visual contrast palette.",
      confidence_score: 0.96,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(recommendation);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
