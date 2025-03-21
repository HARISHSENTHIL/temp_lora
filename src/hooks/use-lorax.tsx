"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { Logger } from "@/lib/utils";

interface Adapter {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
}

interface GenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  adapterId?: string | null;
  modelName: string;
  systemPrompt?: string;
}

export function useLorax() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logger] = useState(() => new Logger());
  const [adapters, setAdapters] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [isLoadingAdapters, setIsLoadingAdapters] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const generate = useCallback(async (options: GenerateOptions) => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.log(`Starting generation with model: ${options.modelName}${options.adapterId ? ' and adapter: ' + options.adapterId : ''}`);
      
      const response = await axios.post(`${apiUrl}/generate`, {
        model_name: options.modelName,
        adapter_name: options.adapterId === null ? "None" : options.adapterId,
        prompt: options.prompt,
        max_tokens: options.maxTokens || 64,
        temperature: options.temperature || 0.7,
        system_prompt: options.systemPrompt || "",
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      logger.log("Generation completed successfully");
      
      if (response.data.logs) {
        response.data.logs.forEach((log: string) => logger.log(log));
      }
      
      return {
        generatedText: response.data.response || "",
        logs: logger.logs.join("\n"),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.log(`Error: ${message}`);
      setError(message);
      
      return {
        generatedText: `Error: ${message}`,
        logs: logger.logs.join("\n"),
      };
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, logger]);

  const fetchAdapters = useCallback(async () => {
    setIsLoadingAdapters(true);
    setError(null);
    
    try {
      logger.log("Fetching available adapters");
      const response = await axios.get(`${apiUrl}/adapters`);
      
      setAdapters(response.data.adapters || []);
      logger.log(`Found ${response.data.adapters?.length || 0} adapters`);
      
      return response.data.adapters;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.log(`Error fetching adapters: ${message}`);
      setError(message);
      return [];
    } finally {
      setIsLoadingAdapters(false);
    }
  }, [apiUrl, logger]);

  const fetchModels = useCallback(async () => {
    setIsLoadingModels(true);
    setError(null);
    
    try {
      logger.log("Fetching available models");
      const response = await axios.get(`${apiUrl}/models`);
      
      setModels(response.data.models || []);
      logger.log(`Found ${response.data.models?.length || 0} models`);
      
      return response.data.models;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.log(`Error fetching models: ${message}`);
      setError(message);
      return [];
    } finally {
      setIsLoadingModels(false);
    }
  }, [apiUrl, logger]);

  return {
    generate,
    fetchAdapters,
    fetchModels,
    adapters,
    models,
    isLoading,
    isLoadingAdapters,
    isLoadingModels,
    error,
    logs: logger.logs,
  };
} 