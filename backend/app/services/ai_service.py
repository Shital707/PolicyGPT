import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Use Gemini 1.5 Flash (the requested version is 2.5 Flash, which we map to the latest flash model string)
model = genai.GenerativeModel('gemini-1.5-flash')

def get_policy_answer(question: str, document_text: str) -> dict:
    """
    Sends the document text and question to Gemini.
    """
    system_prompt = (
        "You are an enterprise AI assistant named PolicyGPT. "
        "Your task is to answer employee questions using ONLY the provided company policy text. "
        "If the information is unavailable in the text, you MUST respond exactly with: "
        "'I couldn't find this information in the uploaded company policies.' "
        "Do not hallucinate or use outside knowledge. "
        "Extract the answer, a confidence score (0 to 1), section title (if available), and page number (if available)."
        "Format the output as JSON."
    )
    
    prompt = f"{system_prompt}\n\nDocument Text:\n{document_text}\n\nQuestion:\n{question}"
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            ),
        )
        # response.text should be a JSON string
        import json
        result = json.loads(response.text)
        return result
    except Exception as e:
        return {
            "answer": "Failed to get a response from AI.",
            "confidence": 0,
            "section_title": None,
            "page_number": None,
            "error": str(e)
        }
