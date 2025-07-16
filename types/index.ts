export interface Source {
  idsource: number;
  idpers: number;
  sources: string;
}

export interface Perspective {
  idpers: number;
  content: string;
}

export interface CommunityNote {
  idcomm: number;
  idpers: number;
  notes: string;
  userEmail: string;
}

export interface Topic {
  idtopic: number;
  judul: string;
  desc: string;
  perspectives: Perspective[];
}

export interface User {
  email: string;
  nama: string;
  pass: string;
}
