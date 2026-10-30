/**
 * Datas históricas. As perguntas saem desta tabela, como as de Geografia saem da tabela de lugares.
 * Fama: 1 = todo mundo conhece, 2 = conhecido, 3 = pouco conhecido. Ela define em que estágio o fato aparece.
 * `nome` vai na pergunta ("Ano da Lei Áurea?"); `curto` vai nas alternativas, com até 20 letras e sem o ano.
 */

import type { Fama } from '../geografia/dados';

export interface Fato {
  ano: number;
  nome: string;
  /** Preposição antes do nome: "do descobrimento", "da Lei Áurea", "das Diretas Já". */
  de: 'do' | 'da' | 'dos' | 'das' | 'de';
  curto: string;
  fama: Fama;
}

export const FATOS_BRASIL: Fato[] = [
  { ano: 1500, nome: 'descobrimento do Brasil', de: 'do', curto: 'Chegada de Cabral', fama: 1 },
  { ano: 1534, nome: 'capitanias hereditárias', de: 'das', curto: 'Capitanias', fama: 3 },
  { ano: 1549, nome: 'fundação de Salvador', de: 'da', curto: 'Fundação de Salvador', fama: 2 },
  { ano: 1554, nome: 'fundação de São Paulo', de: 'da', curto: 'Fundação de SP', fama: 2 },
  { ano: 1565, nome: 'fundação do Rio de Janeiro', de: 'da', curto: 'Fundação do Rio', fama: 3 },
  { ano: 1789, nome: 'Inconfidência Mineira', de: 'da', curto: 'Inconfidência', fama: 2 },
  { ano: 1792, nome: 'execução de Tiradentes', de: 'da', curto: 'Morte de Tiradentes', fama: 2 },
  { ano: 1808, nome: 'chegada da Família Real', de: 'da', curto: 'Família Real chega', fama: 1 },
  { ano: 1822, nome: 'Independência do Brasil', de: 'da', curto: 'Grito do Ipiranga', fama: 1 },
  { ano: 1824, nome: 'primeira Constituição', de: 'da', curto: '1ª Constituição', fama: 3 },
  { ano: 1831, nome: 'abdicação de D. Pedro I', de: 'da', curto: 'Abdicação de Pedro I', fama: 3 },
  { ano: 1840, nome: 'Golpe da Maioridade', de: 'do', curto: 'Golpe da Maioridade', fama: 3 },
  { ano: 1850, nome: 'Lei Eusébio de Queirós', de: 'da', curto: 'Fim do tráfico', fama: 3 },
  { ano: 1864, nome: 'início da Guerra do Paraguai', de: 'do', curto: 'Guerra do Paraguai', fama: 2 },
  { ano: 1871, nome: 'Lei do Ventre Livre', de: 'da', curto: 'Lei do Ventre Livre', fama: 3 },
  { ano: 1888, nome: 'Lei Áurea', de: 'da', curto: 'Lei Áurea', fama: 1 },
  { ano: 1889, nome: 'Proclamação da República', de: 'da', curto: 'República no Brasil', fama: 1 },
  { ano: 1904, nome: 'Revolta da Vacina', de: 'da', curto: 'Revolta da Vacina', fama: 3 },
  { ano: 1906, nome: 'voo do 14-Bis', de: 'do', curto: 'Voo do 14-Bis', fama: 2 },
  { ano: 1910, nome: 'Revolta da Chibata', de: 'da', curto: 'Revolta da Chibata', fama: 3 },
  { ano: 1922, nome: 'Semana de Arte Moderna', de: 'da', curto: 'Semana de Arte', fama: 2 },
  { ano: 1932, nome: 'voto feminino no Brasil', de: 'do', curto: 'Voto feminino', fama: 2 },
  { ano: 1937, nome: 'início do Estado Novo', de: 'do', curto: 'Estado Novo', fama: 3 },
  { ano: 1950, nome: 'Maracanaço', de: 'do', curto: 'Maracanaço', fama: 2 },
  { ano: 1953, nome: 'criação da Petrobras', de: 'da', curto: 'Criação da Petrobras', fama: 3 },
  { ano: 1954, nome: 'morte de Getúlio Vargas', de: 'da', curto: 'Morte de Vargas', fama: 2 },
  { ano: 1958, nome: 'primeiro título na Copa', de: 'do', curto: '1º título na Copa', fama: 2 },
  { ano: 1960, nome: 'inauguração de Brasília', de: 'da', curto: 'Brasília inaugurada', fama: 1 },
  { ano: 1964, nome: 'golpe militar', de: 'do', curto: 'Golpe militar', fama: 1 },
  { ano: 1968, nome: 'AI-5', de: 'do', curto: 'AI-5', fama: 3 },
  { ano: 1970, nome: 'tri na Copa do Mundo', de: 'do', curto: 'Tri na Copa', fama: 2 },
  { ano: 1984, nome: 'Diretas Já', de: 'das', curto: 'Diretas Já', fama: 2 },
  { ano: 1985, nome: 'fim da ditadura militar', de: 'do', curto: 'Fim da ditadura', fama: 2 },
  { ano: 1988, nome: 'Constituição Cidadã', de: 'da', curto: 'Constituição Cidadã', fama: 2 },
  { ano: 1992, nome: 'impeachment de Collor', de: 'do', curto: 'Saída de Collor', fama: 3 },
  { ano: 1994, nome: 'Plano Real', de: 'do', curto: 'Plano Real', fama: 2 },
  { ano: 2002, nome: 'penta na Copa do Mundo', de: 'do', curto: 'Penta na Copa', fama: 2 },
];

export const FATOS_MUNDO: Fato[] = [
  { ano: 476, nome: 'queda de Roma', de: 'da', curto: 'Queda de Roma', fama: 2 },
  { ano: 1096, nome: 'primeira Cruzada', de: 'da', curto: '1ª Cruzada', fama: 3 },
  { ano: 1215, nome: 'Magna Carta', de: 'da', curto: 'Magna Carta', fama: 3 },
  { ano: 1347, nome: 'chegada da Peste Negra', de: 'da', curto: 'Peste Negra', fama: 3 },
  { ano: 1453, nome: 'queda de Constantinopla', de: 'da', curto: 'Queda de Bizâncio', fama: 2 },
  { ano: 1492, nome: 'chegada de Colombo', de: 'da', curto: 'Chegada de Colombo', fama: 1 },
  { ano: 1498, nome: 'Vasco da Gama na Índia', de: 'de', curto: 'Vasco chega à Índia', fama: 2 },
  { ano: 1517, nome: 'Reforma Protestante', de: 'da', curto: 'Reforma Protestante', fama: 2 },
  { ano: 1776, nome: 'independência dos EUA', de: 'da', curto: 'EUA independentes', fama: 1 },
  { ano: 1789, nome: 'Revolução Francesa', de: 'da', curto: 'Revolução Francesa', fama: 1 },
  { ano: 1804, nome: 'coroação de Napoleão', de: 'da', curto: 'Napoleão imperador', fama: 2 },
  { ano: 1815, nome: 'Batalha de Waterloo', de: 'da', curto: 'Waterloo', fama: 2 },
  { ano: 1869, nome: 'abertura do Canal de Suez', de: 'da', curto: 'Canal de Suez', fama: 3 },
  { ano: 1871, nome: 'unificação da Alemanha', de: 'da', curto: 'Alemanha unificada', fama: 3 },
  { ano: 1912, nome: 'naufrágio do Titanic', de: 'do', curto: 'Titanic afunda', fama: 1 },
  { ano: 1914, nome: 'início da 1ª Guerra Mundial', de: 'do', curto: '1ª Guerra começa', fama: 1 },
  { ano: 1917, nome: 'Revolução Russa', de: 'da', curto: 'Revolução Russa', fama: 2 },
  { ano: 1918, nome: 'fim da 1ª Guerra Mundial', de: 'do', curto: '1ª Guerra acaba', fama: 2 },
  { ano: 1929, nome: 'quebra da Bolsa de Nova York', de: 'da', curto: 'Quebra da Bolsa', fama: 2 },
  { ano: 1939, nome: 'início da 2ª Guerra Mundial', de: 'do', curto: '2ª Guerra começa', fama: 1 },
  { ano: 1945, nome: 'fim da 2ª Guerra Mundial', de: 'do', curto: '2ª Guerra acaba', fama: 1 },
  { ano: 1945, nome: 'bomba de Hiroshima', de: 'da', curto: 'Bomba de Hiroshima', fama: 2 },
  { ano: 1947, nome: 'independência da Índia', de: 'da', curto: 'Índia independente', fama: 3 },
  { ano: 1957, nome: 'lançamento do Sputnik', de: 'do', curto: 'Sputnik no espaço', fama: 3 },
  { ano: 1961, nome: 'construção do Muro de Berlim', de: 'da', curto: 'Muro de Berlim sobe', fama: 2 },
  { ano: 1961, nome: 'voo de Gagárin', de: 'do', curto: 'Gagárin no espaço', fama: 3 },
  { ano: 1963, nome: 'morte de Kennedy', de: 'da', curto: 'Morte de Kennedy', fama: 2 },
  { ano: 1969, nome: 'chegada do homem à Lua', de: 'da', curto: 'Homem na Lua', fama: 1 },
  { ano: 1989, nome: 'queda do Muro de Berlim', de: 'da', curto: 'Queda do Muro', fama: 1 },
  { ano: 1991, nome: 'fim da União Soviética', de: 'do', curto: 'Fim da URSS', fama: 2 },
  { ano: 1994, nome: 'eleição de Mandela', de: 'da', curto: 'Mandela eleito', fama: 3 },
  { ano: 2001, nome: 'ataque às Torres Gêmeas', de: 'do', curto: '11 de Setembro', fama: 1 },
  { ano: 2007, nome: 'lançamento do iPhone', de: 'do', curto: 'Lançamento do iPhone', fama: 2 },
];
