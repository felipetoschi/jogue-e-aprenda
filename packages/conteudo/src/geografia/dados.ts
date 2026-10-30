/**
 * Dados de Geografia. As perguntas saem destas tabelas, como as contas saem dos geradores da Matemática.
 * Fama: 1 = todo mundo conhece, 2 = conhecido, 3 = pouco conhecido. Ela define em que estágio o item aparece.
 * Nomes com até 20 letras, para caberem nas alternativas no celular.
 */

export const REGIOES_BRASIL = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'] as const;
export type RegiaoBrasil = (typeof REGIOES_BRASIL)[number];

/** Regiões que fazem divisa, para a errada ser uma confusão plausível. */
export const REGIOES_VIZINHAS: Record<RegiaoBrasil, RegiaoBrasil[]> = {
  Norte: ['Nordeste', 'Centro-Oeste'],
  Nordeste: ['Norte', 'Sudeste', 'Centro-Oeste'],
  'Centro-Oeste': ['Norte', 'Sudeste', 'Sul', 'Nordeste'],
  Sudeste: ['Sul', 'Centro-Oeste', 'Nordeste'],
  Sul: ['Sudeste', 'Centro-Oeste'],
};

export type Fama = 1 | 2 | 3;

export interface Estado {
  nome: string;
  sigla: string;
  capital: string;
  regiao: RegiaoBrasil;
  /** Preposição antes do nome: "do Ceará", "da Bahia", "de Goiás". */
  de: 'do' | 'da' | 'de';
  fama: Fama;
}

export const ESTADOS: Estado[] = [
  { nome: 'Acre', sigla: 'AC', capital: 'Rio Branco', regiao: 'Norte', de: 'do', fama: 3 },
  { nome: 'Alagoas', sigla: 'AL', capital: 'Maceió', regiao: 'Nordeste', de: 'de', fama: 2 },
  { nome: 'Amapá', sigla: 'AP', capital: 'Macapá', regiao: 'Norte', de: 'do', fama: 3 },
  { nome: 'Amazonas', sigla: 'AM', capital: 'Manaus', regiao: 'Norte', de: 'do', fama: 1 },
  { nome: 'Bahia', sigla: 'BA', capital: 'Salvador', regiao: 'Nordeste', de: 'da', fama: 1 },
  { nome: 'Ceará', sigla: 'CE', capital: 'Fortaleza', regiao: 'Nordeste', de: 'do', fama: 1 },
  { nome: 'Distrito Federal', sigla: 'DF', capital: 'Brasília', regiao: 'Centro-Oeste', de: 'do', fama: 1 },
  { nome: 'Espírito Santo', sigla: 'ES', capital: 'Vitória', regiao: 'Sudeste', de: 'do', fama: 2 },
  { nome: 'Goiás', sigla: 'GO', capital: 'Goiânia', regiao: 'Centro-Oeste', de: 'de', fama: 2 },
  { nome: 'Maranhão', sigla: 'MA', capital: 'São Luís', regiao: 'Nordeste', de: 'do', fama: 2 },
  { nome: 'Mato Grosso', sigla: 'MT', capital: 'Cuiabá', regiao: 'Centro-Oeste', de: 'de', fama: 2 },
  { nome: 'Mato Grosso do Sul', sigla: 'MS', capital: 'Campo Grande', regiao: 'Centro-Oeste', de: 'de', fama: 2 },
  { nome: 'Minas Gerais', sigla: 'MG', capital: 'Belo Horizonte', regiao: 'Sudeste', de: 'de', fama: 1 },
  { nome: 'Pará', sigla: 'PA', capital: 'Belém', regiao: 'Norte', de: 'do', fama: 1 },
  { nome: 'Paraíba', sigla: 'PB', capital: 'João Pessoa', regiao: 'Nordeste', de: 'da', fama: 2 },
  { nome: 'Paraná', sigla: 'PR', capital: 'Curitiba', regiao: 'Sul', de: 'do', fama: 1 },
  { nome: 'Pernambuco', sigla: 'PE', capital: 'Recife', regiao: 'Nordeste', de: 'de', fama: 1 },
  { nome: 'Piauí', sigla: 'PI', capital: 'Teresina', regiao: 'Nordeste', de: 'do', fama: 2 },
  { nome: 'Rio de Janeiro', sigla: 'RJ', capital: 'Rio de Janeiro', regiao: 'Sudeste', de: 'do', fama: 1 },
  { nome: 'Rio Grande do Norte', sigla: 'RN', capital: 'Natal', regiao: 'Nordeste', de: 'do', fama: 2 },
  { nome: 'Rio Grande do Sul', sigla: 'RS', capital: 'Porto Alegre', regiao: 'Sul', de: 'do', fama: 1 },
  { nome: 'Rondônia', sigla: 'RO', capital: 'Porto Velho', regiao: 'Norte', de: 'de', fama: 3 },
  { nome: 'Roraima', sigla: 'RR', capital: 'Boa Vista', regiao: 'Norte', de: 'de', fama: 3 },
  { nome: 'Santa Catarina', sigla: 'SC', capital: 'Florianópolis', regiao: 'Sul', de: 'de', fama: 1 },
  { nome: 'São Paulo', sigla: 'SP', capital: 'São Paulo', regiao: 'Sudeste', de: 'de', fama: 1 },
  { nome: 'Sergipe', sigla: 'SE', capital: 'Aracaju', regiao: 'Nordeste', de: 'de', fama: 3 },
  { nome: 'Tocantins', sigla: 'TO', capital: 'Palmas', regiao: 'Norte', de: 'do', fama: 3 },
];

export const CONTINENTES = ['América', 'Europa', 'Ásia', 'África', 'Oceania'] as const;
export type Continente = (typeof CONTINENTES)[number];

/** Parte do continente, para as capitais erradas virem de perto (Lima com Quito, não com Tóquio). */
export type RegiaoMundo = 'América do Sul' | 'América Central' | 'América do Norte' | 'Europa' | 'Ásia' | 'África' | 'Oceania';

export const CONTINENTE_DA_REGIAO: Record<RegiaoMundo, Continente> = {
  'América do Sul': 'América',
  'América Central': 'América',
  'América do Norte': 'América',
  Europa: 'Europa',
  Ásia: 'Ásia',
  África: 'África',
  Oceania: 'Oceania',
};

export interface Pais {
  nome: string;
  capital: string;
  regiao: RegiaoMundo;
  de: 'do' | 'da' | 'de' | 'dos' | 'das';
  fama: Fama;
  /** A cidade famosa que muita gente acha que é a capital. */
  armadilha?: string;
  /** Fica em dois continentes: fora das perguntas de continente. */
  transcontinental?: true;
}

export const PAISES: Pais[] = [
  // América do Sul
  { nome: 'Argentina', capital: 'Buenos Aires', regiao: 'América do Sul', de: 'da', fama: 1 },
  { nome: 'Brasil', capital: 'Brasília', regiao: 'América do Sul', de: 'do', fama: 1, armadilha: 'Rio de Janeiro' },
  { nome: 'Chile', capital: 'Santiago', regiao: 'América do Sul', de: 'do', fama: 1 },
  { nome: 'Colômbia', capital: 'Bogotá', regiao: 'América do Sul', de: 'da', fama: 1, armadilha: 'Medellín' },
  { nome: 'Equador', capital: 'Quito', regiao: 'América do Sul', de: 'do', fama: 2, armadilha: 'Guayaquil' },
  { nome: 'Guiana', capital: 'Georgetown', regiao: 'América do Sul', de: 'da', fama: 3 },
  { nome: 'Paraguai', capital: 'Assunção', regiao: 'América do Sul', de: 'do', fama: 1 },
  { nome: 'Peru', capital: 'Lima', regiao: 'América do Sul', de: 'do', fama: 1 },
  { nome: 'Suriname', capital: 'Paramaribo', regiao: 'América do Sul', de: 'do', fama: 3 },
  { nome: 'Uruguai', capital: 'Montevidéu', regiao: 'América do Sul', de: 'do', fama: 1 },
  { nome: 'Venezuela', capital: 'Caracas', regiao: 'América do Sul', de: 'da', fama: 1 },
  // América Central e Caribe
  { nome: 'Costa Rica', capital: 'San José', regiao: 'América Central', de: 'da', fama: 3 },
  { nome: 'Cuba', capital: 'Havana', regiao: 'América Central', de: 'de', fama: 2 },
  { nome: 'El Salvador', capital: 'San Salvador', regiao: 'América Central', de: 'de', fama: 3 },
  { nome: 'Guatemala', capital: 'Cidade da Guatemala', regiao: 'América Central', de: 'da', fama: 3 },
  { nome: 'Haiti', capital: 'Porto Príncipe', regiao: 'América Central', de: 'do', fama: 3 },
  { nome: 'Honduras', capital: 'Tegucigalpa', regiao: 'América Central', de: 'de', fama: 3 },
  { nome: 'Jamaica', capital: 'Kingston', regiao: 'América Central', de: 'da', fama: 3 },
  { nome: 'Nicarágua', capital: 'Manágua', regiao: 'América Central', de: 'da', fama: 3 },
  { nome: 'Panamá', capital: 'Cidade do Panamá', regiao: 'América Central', de: 'do', fama: 2 },
  { nome: 'República Dominicana', capital: 'Santo Domingo', regiao: 'América Central', de: 'da', fama: 3 },
  // América do Norte
  { nome: 'Canadá', capital: 'Ottawa', regiao: 'América do Norte', de: 'do', fama: 1, armadilha: 'Toronto' },
  { nome: 'Estados Unidos', capital: 'Washington', regiao: 'América do Norte', de: 'dos', fama: 1, armadilha: 'Nova York' },
  { nome: 'México', capital: 'Cidade do México', regiao: 'América do Norte', de: 'do', fama: 1, armadilha: 'Cancún' },
  // Europa
  { nome: 'Alemanha', capital: 'Berlim', regiao: 'Europa', de: 'da', fama: 1, armadilha: 'Munique' },
  { nome: 'Áustria', capital: 'Viena', regiao: 'Europa', de: 'da', fama: 2 },
  { nome: 'Bélgica', capital: 'Bruxelas', regiao: 'Europa', de: 'da', fama: 2 },
  { nome: 'Bulgária', capital: 'Sófia', regiao: 'Europa', de: 'da', fama: 3 },
  { nome: 'Croácia', capital: 'Zagreb', regiao: 'Europa', de: 'da', fama: 3 },
  { nome: 'Dinamarca', capital: 'Copenhague', regiao: 'Europa', de: 'da', fama: 2 },
  { nome: 'Espanha', capital: 'Madri', regiao: 'Europa', de: 'da', fama: 1, armadilha: 'Barcelona' },
  { nome: 'Finlândia', capital: 'Helsinque', regiao: 'Europa', de: 'da', fama: 3 },
  { nome: 'França', capital: 'Paris', regiao: 'Europa', de: 'da', fama: 1 },
  { nome: 'Grécia', capital: 'Atenas', regiao: 'Europa', de: 'da', fama: 2 },
  { nome: 'Hungria', capital: 'Budapeste', regiao: 'Europa', de: 'da', fama: 3 },
  { nome: 'Irlanda', capital: 'Dublin', regiao: 'Europa', de: 'da', fama: 2 },
  { nome: 'Islândia', capital: 'Reykjavík', regiao: 'Europa', de: 'da', fama: 3 },
  { nome: 'Itália', capital: 'Roma', regiao: 'Europa', de: 'da', fama: 1, armadilha: 'Milão' },
  { nome: 'Noruega', capital: 'Oslo', regiao: 'Europa', de: 'da', fama: 2 },
  { nome: 'Países Baixos', capital: 'Amsterdã', regiao: 'Europa', de: 'dos', fama: 2, armadilha: 'Roterdã' },
  { nome: 'Polônia', capital: 'Varsóvia', regiao: 'Europa', de: 'da', fama: 2 },
  { nome: 'Portugal', capital: 'Lisboa', regiao: 'Europa', de: 'de', fama: 1, armadilha: 'Porto' },
  { nome: 'Reino Unido', capital: 'Londres', regiao: 'Europa', de: 'do', fama: 1, armadilha: 'Manchester' },
  { nome: 'Romênia', capital: 'Bucareste', regiao: 'Europa', de: 'da', fama: 3 },
  { nome: 'Rússia', capital: 'Moscou', regiao: 'Europa', de: 'da', fama: 1, armadilha: 'São Petersburgo', transcontinental: true },
  { nome: 'Sérvia', capital: 'Belgrado', regiao: 'Europa', de: 'da', fama: 3 },
  { nome: 'Suécia', capital: 'Estocolmo', regiao: 'Europa', de: 'da', fama: 2 },
  { nome: 'Suíça', capital: 'Berna', regiao: 'Europa', de: 'da', fama: 2, armadilha: 'Zurique' },
  { nome: 'Tchéquia', capital: 'Praga', regiao: 'Europa', de: 'da', fama: 3 },
  { nome: 'Ucrânia', capital: 'Kiev', regiao: 'Europa', de: 'da', fama: 2 },
  // Ásia
  { nome: 'Afeganistão', capital: 'Cabul', regiao: 'Ásia', de: 'do', fama: 3 },
  { nome: 'Arábia Saudita', capital: 'Riad', regiao: 'Ásia', de: 'da', fama: 3, armadilha: 'Meca' },
  { nome: 'Cazaquistão', capital: 'Astana', regiao: 'Ásia', de: 'do', fama: 3, transcontinental: true },
  { nome: 'Catar', capital: 'Doha', regiao: 'Ásia', de: 'do', fama: 3 },
  { nome: 'China', capital: 'Pequim', regiao: 'Ásia', de: 'da', fama: 1, armadilha: 'Xangai' },
  { nome: 'Coreia do Norte', capital: 'Pyongyang', regiao: 'Ásia', de: 'da', fama: 3 },
  { nome: 'Coreia do Sul', capital: 'Seul', regiao: 'Ásia', de: 'da', fama: 2 },
  { nome: 'Filipinas', capital: 'Manila', regiao: 'Ásia', de: 'das', fama: 3 },
  { nome: 'Índia', capital: 'Nova Délhi', regiao: 'Ásia', de: 'da', fama: 1, armadilha: 'Mumbai' },
  { nome: 'Indonésia', capital: 'Jacarta', regiao: 'Ásia', de: 'da', fama: 3 },
  { nome: 'Irã', capital: 'Teerã', regiao: 'Ásia', de: 'do', fama: 2 },
  { nome: 'Iraque', capital: 'Bagdá', regiao: 'Ásia', de: 'do', fama: 2 },
  { nome: 'Japão', capital: 'Tóquio', regiao: 'Ásia', de: 'do', fama: 1, armadilha: 'Osaka' },
  { nome: 'Líbano', capital: 'Beirute', regiao: 'Ásia', de: 'do', fama: 3 },
  { nome: 'Malásia', capital: 'Kuala Lumpur', regiao: 'Ásia', de: 'da', fama: 3 },
  { nome: 'Mongólia', capital: 'Ulan Bator', regiao: 'Ásia', de: 'da', fama: 3 },
  { nome: 'Nepal', capital: 'Katmandu', regiao: 'Ásia', de: 'do', fama: 3 },
  { nome: 'Paquistão', capital: 'Islamabad', regiao: 'Ásia', de: 'do', fama: 3, armadilha: 'Karachi' },
  { nome: 'Síria', capital: 'Damasco', regiao: 'Ásia', de: 'da', fama: 3 },
  { nome: 'Tailândia', capital: 'Bangkok', regiao: 'Ásia', de: 'da', fama: 2 },
  { nome: 'Turquia', capital: 'Ancara', regiao: 'Ásia', de: 'da', fama: 2, armadilha: 'Istambul', transcontinental: true },
  { nome: 'Vietnã', capital: 'Hanói', regiao: 'Ásia', de: 'do', fama: 3 },
  // África
  { nome: 'Angola', capital: 'Luanda', regiao: 'África', de: 'de', fama: 2 },
  { nome: 'Argélia', capital: 'Argel', regiao: 'África', de: 'da', fama: 3 },
  { nome: 'Cabo Verde', capital: 'Praia', regiao: 'África', de: 'de', fama: 3 },
  { nome: 'Camarões', capital: 'Iaundé', regiao: 'África', de: 'de', fama: 3, armadilha: 'Duala' },
  { nome: 'Costa do Marfim', capital: 'Yamoussoukro', regiao: 'África', de: 'da', fama: 3, armadilha: 'Abidjan' },
  { nome: 'Egito', capital: 'Cairo', regiao: 'África', de: 'do', fama: 1, armadilha: 'Alexandria' },
  { nome: 'Etiópia', capital: 'Adis Abeba', regiao: 'África', de: 'da', fama: 3 },
  { nome: 'Gana', capital: 'Acra', regiao: 'África', de: 'de', fama: 3 },
  { nome: 'Guiné-Bissau', capital: 'Bissau', regiao: 'África', de: 'da', fama: 3 },
  { nome: 'Líbia', capital: 'Trípoli', regiao: 'África', de: 'da', fama: 3 },
  { nome: 'Madagascar', capital: 'Antananarivo', regiao: 'África', de: 'de', fama: 3 },
  { nome: 'Marrocos', capital: 'Rabat', regiao: 'África', de: 'do', fama: 2, armadilha: 'Casablanca' },
  { nome: 'Moçambique', capital: 'Maputo', regiao: 'África', de: 'de', fama: 2 },
  { nome: 'Nigéria', capital: 'Abuja', regiao: 'África', de: 'da', fama: 2, armadilha: 'Lagos' },
  { nome: 'Quênia', capital: 'Nairóbi', regiao: 'África', de: 'do', fama: 2 },
  { nome: 'Senegal', capital: 'Dacar', regiao: 'África', de: 'do', fama: 3 },
  { nome: 'Sudão', capital: 'Cartum', regiao: 'África', de: 'do', fama: 3 },
  { nome: 'Tanzânia', capital: 'Dodoma', regiao: 'África', de: 'da', fama: 3, armadilha: 'Dar es Salaam' },
  { nome: 'Tunísia', capital: 'Túnis', regiao: 'África', de: 'da', fama: 3 },
  { nome: 'Zimbábue', capital: 'Harare', regiao: 'África', de: 'do', fama: 3 },
  // Oceania
  { nome: 'Austrália', capital: 'Camberra', regiao: 'Oceania', de: 'da', fama: 1, armadilha: 'Sydney' },
  { nome: 'Fiji', capital: 'Suva', regiao: 'Oceania', de: 'de', fama: 3 },
  { nome: 'Nova Zelândia', capital: 'Wellington', regiao: 'Oceania', de: 'da', fama: 2, armadilha: 'Auckland' },
  { nome: 'Papua-Nova Guiné', capital: 'Port Moresby', regiao: 'Oceania', de: 'de', fama: 3 },
];
