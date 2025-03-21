import { LoraxForm } from "@/components/lorax-form";

export default function Home() {
  return (
    <div className="my-6">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to Model Multiplexer</h1>
        <p className="text-white">
          Generate text using large language models and LoRA adapters
        </p>
      </div>
      <LoraxForm />
    </div>
  );
}
