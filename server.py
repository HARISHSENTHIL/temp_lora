from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from lorax import Client
from datetime import datetime
import os

app = FastAPI()

client = Client("http://127.0.0.1:8080")

BASE_MODELS = {
    "Mistral-7B-Instruct-v0.1": "mistralai/Mistral-7B-Instruct-v0.1",
    "Meta-Llama-3.2-1B": "meta-llama/Llama-3.2-1B"
}

ADAPTER_BASE_PATH = "/home/ubuntu/Apps/LLamafactory-web3/saves"

# Logger
logs = []

def log(message: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{timestamp}] {message}"
    logs.append(entry)
    return entry

def get_local_adapters():
    adapters = {}
    if os.path.exists(ADAPTER_BASE_PATH):
        for model_dir in os.listdir(ADAPTER_BASE_PATH):
            model_path = os.path.join(ADAPTER_BASE_PATH, model_dir, "lora")
            if os.path.exists(model_path):
                for adapter_dir in os.listdir(model_path):
                    adapter_path = os.path.join(model_path, adapter_dir)
                    if os.path.exists(os.path.join(adapter_path, "adapter_config.json")):
                        adapters[adapter_dir] = adapter_path
    return adapters

class GenerationInput(BaseModel):
    model_name: str
    adapter_name: str = "None"
    prompt: str
    max_tokens: int = 64
    temperature: float = 0.7
    system_prompt: str = ""

@app.get("/adapters")
def list_adapters():
    current_adapters = get_local_adapters()
    return {"adapters": ["None"] + list(current_adapters.keys())}

@app.get("/models")
def list_models():
    return {"models": list(BASE_MODELS.keys())}

@app.post("/generate")
def generate(input: GenerationInput):
    try:
        log(f"Selected model: {input.model_name}")
        log(f"Selected adapter: {input.adapter_name}")
        full_prompt = f"[INST] {input.system_prompt}\n\n{input.prompt} [/INST]" if input.system_prompt else f"[INST] {input.prompt} [/INST]"

        current_adapters = get_local_adapters()
        if input.adapter_name != "None" and input.adapter_name in current_adapters:
            response = client.generate(
                full_prompt,
                max_new_tokens=input.max_tokens,
                adapter_id=f"/adapters/{input.model_name}/lora/{input.adapter_name}",
                adapter_source="local",
                temperature=input.temperature
            )
        else:
            log("No adapter selected, using base model")
            response = client.generate(
                full_prompt,
                max_new_tokens=input.max_tokens,
                temperature=input.temperature
            )

        log("Generation completed successfully")
        return {
            "response": response.generated_text,
            "logs": logs[-10:]
        }
    except Exception as e:
        log(f"Error: {str(e)}")
        return {"error": str(e), "logs": logs[-10:]}

# Allow cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True) 