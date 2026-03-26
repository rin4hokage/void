import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  project_id: number | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: number;
  name: string;
  description: string | null;
  color: string;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbComm {
  id: number;
  task_id: number | null;
  project_id: number | null;
  sender: string;
  message: string;
  message_type: string;
  created_at: string;
}

export interface DbAgent {
  id: string;
  name: string;
  status: string;
  current_task_id: number | null;
  last_activity: string | null;
  avatar_url: string | null;
}

export function useTasks(pollInterval = 5000) {
  const [tasks, setTasks] = useState<DbTask[]>([]);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTasks(data as DbTask[]);
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, pollInterval);
    return () => clearInterval(interval);
  }, [fetchTasks, pollInterval]);

  const addTask = async (task: Partial<DbTask>) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task as any)
      .select()
      .single();
    if (data && !error) setTasks((prev) => [data as DbTask, ...prev]);
    return { data, error };
  };

  const updateTask = async (id: number, updates: Partial<DbTask>) => {
    const { error } = await supabase.from("tasks").update(updates as any).eq("id", id);
    if (!error) setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    return { error };
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, fetchTasks, addTask, updateTask, deleteTask };
}

export function useProjects() {
  const [projects, setProjects] = useState<DbProject[]>([]);

  const fetchProjects = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data as DbProject[]);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (project: Partial<DbProject>) => {
    const { data, error } = await supabase
      .from("projects")
      .insert(project as any)
      .select()
      .single();
    if (data && !error) setProjects((prev) => [data as DbProject, ...prev]);
    return { data, error };
  };

  const updateProject = async (id: number, updates: Partial<DbProject>) => {
    const { error } = await supabase.from("projects").update(updates as any).eq("id", id);
    if (!error) setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  return { projects, fetchProjects, addProject, updateProject };
}

export function useComms(taskId: number | null, pollInterval = 3000) {
  const [messages, setMessages] = useState<DbComm[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!taskId) { setMessages([]); return; }
    const { data } = await supabase
      .from("comms")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as DbComm[]);
  }, [taskId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, pollInterval);
    return () => clearInterval(interval);
  }, [fetchMessages, pollInterval]);

  const sendMessage = async (message: string, taskId: number) => {
    const { data, error } = await supabase
      .from("comms")
      .insert({ task_id: taskId, sender: "EJ", message, message_type: "text" } as any)
      .select()
      .single();
    if (data && !error) setMessages((prev) => [...prev, data as DbComm]);
    return { data, error };
  };

  return { messages, fetchMessages, sendMessage };
}

export function useAgents(pollInterval = 10000) {
  const [agents, setAgents] = useState<DbAgent[]>([]);

  const fetchAgents = useCallback(async () => {
    const { data } = await supabase
      .from("agents")
      .select("*");
    if (data) setAgents(data as DbAgent[]);
  }, []);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, pollInterval);
    return () => clearInterval(interval);
  }, [fetchAgents, pollInterval]);

  return { agents, fetchAgents };
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    tasksInProgress: 0,
    completedThisWeek: 0,
    agentsOnline: 0,
    totalAgents: 0,
    awaitingInput: 0,
  });

  const fetchStats = useCallback(async () => {
    const [doingRes, doneRes, inputRes, agentsRes] = await Promise.all([
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "doing"),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "done")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "needs_input"),
      supabase.from("agents").select("*"),
    ]);

    const agentList = (agentsRes.data || []) as DbAgent[];
    setStats({
      tasksInProgress: doingRes.count || 0,
      completedThisWeek: doneRes.count || 0,
      agentsOnline: agentList.filter((a) => a.status !== "idle").length,
      totalAgents: agentList.length,
      awaitingInput: inputRes.count || 0,
    });
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return stats;
}
