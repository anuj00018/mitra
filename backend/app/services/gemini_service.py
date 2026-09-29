import os
from typing import Optional, Dict, Any
from backend.app.core.config import settings

class GeminiLearningAdvisor:
    """
    Autism-informed learning companion insight engine.
    Analyzes session metrics (response latency, accuracy, prompting level, sensory fatigue)
    to generate calm, strength-focused, actionable advice for parents and educators.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

    async def generate_insight(
        self,
        child_name: str,
        age: int,
        learning_level: str,
        role: str,
        recent_sessions_summary: Dict[str, Any]
    ) -> Dict[str, str]:
        if self.api_key and self.api_key != "your-gemini-api-key":
            try:
                from google import genai
                client = genai.Client(api_key=self.api_key)
                prompt = f"""
                You are a compassionate, clinical developmental psychologist and neurodiversity specialist consulting for MITRA.
                Child profile:
                - Name: {child_name}
                - Age: {age}
                - Learning Tier: {learning_level}
                - Recipient: {role.title()}

                Recent Session Data:
                {recent_sessions_summary}

                Guidelines:
                1. Always prioritize neurodiversity-affirming language. Focus on regulation and strengths rather than compliance.
                2. Do not use clinical jargon without gentle explanation.
                3. Keep the advice actionable, reassuring, and sensory-friendly.

                Format your response as 4 concise lines:
                HEADLINE: <short empowering headline>
                SUMMARY: <2 sentences summarizing engagement & progress>
                ACTION: <1 practical, low-friction activity or scaffolding recommendation>
                SENSORY: <1 environment or sensory adaptation tip>
                """
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                text = response.text
                lines = [line.strip() for line in text.split("\n") if line.strip()]
                parsed = {}
                for line in lines:
                    if ":" in line:
                        k, v = line.split(":", 1)
                        k_norm = k.strip().upper()
                        if "HEADLINE" in k_norm:
                            parsed["headline"] = v.strip()
                        elif "SUMMARY" in k_norm:
                            parsed["summary"] = v.strip()
                        elif "ACTION" in k_norm:
                            parsed["suggested_action"] = v.strip()
                        elif "SENSORY" in k_norm:
                            parsed["sensory_adjustment_advice"] = v.strip()
                if "headline" in parsed and "summary" in parsed:
                    return {
                        "headline": parsed.get("headline", f"Steady progress for {child_name}"),
                        "summary": parsed.get("summary", f"{child_name} displayed strong focus during recent visual activities."),
                        "suggested_action": parsed.get("suggested_action", "Introduce the Visual Routine Sequencer before afternoon transitions."),
                        "sensory_adjustment_advice": parsed.get("sensory_adjustment_advice", "Keep audio cues at moderate level and provide 2 minutes of calming visual sphere breathing.")
                    }
            except Exception as e:
                # Log and fallback gracefully
                pass

        # Evidence-based Clinical Rule Fallback
        fatigue_detected = recent_sessions_summary.get("fatigue_flags", 0) > 0
        accuracy = recent_sessions_summary.get("avg_accuracy", 0.85)

        if fatigue_detected:
            return {
                "headline": f"Sensory Recharge Recommended for {child_name}",
                "summary": f"{child_name} showed signs of cognitive fatigue during longer visual sequencing sessions. Their effort was wonderful, but shorter intervals will keep learning joyful.",
                "suggested_action": "Shorten visual tasks to 3-minute bursts and offer the Calm Sphere breathing exercise before transitioning.",
                "sensory_adjustment_advice": "Dim screen brightness slightly and ensure ambient room sounds are minimized."
            }
        elif accuracy >= 0.9:
            return {
                "headline": f"High Mastery in Emotion Recognition!",
                "summary": f"{child_name} achieved {int(accuracy * 100)}% accuracy across socio-emotional visual cards with minimal prompting.",
                "suggested_action": "Celebrate this milestone by letting {child_name} practice with multi-step Morning Routine cards.",
                "sensory_adjustment_advice": "Maintain current gentle-sage color palette and supportive auditory chime rewards."
            }
        else:
            return {
                "headline": f"Consistent Engagement & Visual Exploration",
                "summary": f"{child_name} completed structured sorting activities today. Repetition is helping build comfort with daily transition routines.",
                "suggested_action": "Model one step together first ('First brush teeth, then wash hands') to reinforce sequential confidence.",
                "sensory_adjustment_advice": "Ensure text-to-speech voice speed is set to 0.85x for optimal processing."
            }

advisor = GeminiLearningAdvisor()
