"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useLorax } from "@/hooks/use-lorax";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LoraxForm() {
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [maxTokens, setMaxTokens] = useState(64);
  const [temperature, setTemperature] = useState(0.7);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedAdapter, setSelectedAdapter] = useState<string | null>("None");
  const [logs, setLogs] = useState("");

  const { 
    generate, 
    fetchAdapters, 
    fetchModels,
    adapters, 
    models,
    isLoading, 
    isLoadingAdapters, 
    isLoadingModels,
    error 
  } = useLorax();

  useEffect(() => {
    fetchAdapters();
    fetchModels();
  }, [fetchAdapters, fetchModels]);

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() || !selectedModel) return;
    
    const result = await generate({
      prompt,
      systemPrompt,
      maxTokens,
      temperature,
      adapterId: selectedAdapter,
      modelName: selectedModel,
    });
    
    setOutput(result.generatedText);
    setLogs(result.logs);
  };

  const handleClear = () => {
    setPrompt("");
    setOutput("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="model-select">Select Base Model</Label>
            <Select
              value={selectedModel}
              onValueChange={(value) => setSelectedModel(value)}
            >
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingModels ? (
                  <SelectItem value="loading" disabled>
                    Loading models...
                  </SelectItem>
                ) : (
                  models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="adapter-select">Select LoRA Adapter</Label>
            <Select
              value={selectedAdapter || "None"}
              onValueChange={(value) => setSelectedAdapter(value)}
            >
              <SelectTrigger id="adapter-select">
                <SelectValue placeholder="Select an adapter" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingAdapters ? (
                  <SelectItem value="loading" disabled>
                    Loading adapters...
                  </SelectItem>
                ) : (
                  adapters.map((adapter) => (
                    <SelectItem key={adapter} value={adapter}>
                      {adapter}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="system-prompt">System Prompt (Optional)</Label>
          <Textarea
            id="system-prompt"
            placeholder="Add system instructions here..."
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
            </div>
            <Slider
              id="max-tokens"
              min={16}
              max={2048}
              step={16}
              value={[maxTokens]}
              onValueChange={(values) => setMaxTokens(values[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
            </div>
            <Slider
              id="temperature"
              min={0.1}
              max={1.0}
              step={0.1}
              value={[temperature]}
              onValueChange={(values) => setTemperature(values[0])}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="input-prompt">Input Prompt</Label>
          <Textarea
            id="input-prompt"
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {isLoading ? "Generating..." : "Generate"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClear}
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            Clear
          </Button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        <div>
          <Label htmlFor="output">Model Response</Label>
          <Textarea
            id="output"
            value={output}
            readOnly
            rows={6}
            className="bg-white border text-black"
          />
        </div>

        {/* <div>
          <Label htmlFor="logs">Logs</Label>
          <div
            id="logs"
            className="h-32 overflow-y-auto p-2 bg-white border rounded-md text-xs font-mono"
          >
            {logs.split("\n").map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div> */}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 