export type Categoria = 'comunicacion' | 'confianza' | 'problemas' | 'creatividad' | 'liderazgo' | 'icebreaker' | 'colaboracion';

export interface Dinamica {
  id: string;
  nombre: string;
  categoria: Categoria;
  descripcion: string;
  objetivo: string;
  duracion: number;
  participantesMin: number;
  participantesMax: number;
  materiales: string[];
  instrucciones: string[];
  consejos: string[];
  icono: string;
}

export const CATEGORIAS: Record<Categoria, { label: string; color: string }> = {
  comunicacion: { label: 'Comunicación', color: '#4A90D9' },
  confianza: { label: 'Confianza', color: '#7B68EE' },
  problemas: { label: 'Resolución de Problemas', color: '#E67E22' },
  creatividad: { label: 'Creatividad', color: '#2ECC71' },
  liderazgo: { label: 'Liderazgo', color: '#E74C3C' },
  icebreaker: { label: 'Icebreaker', color: '#F39C12' },
  colaboracion: { label: 'Colaboración', color: '#1ABC9C' },
};
