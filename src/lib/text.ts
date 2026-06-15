// Normaliza texto para búsquedas: minúsculas y sin tildes. Así "gomez"
// encuentra "Gómez" y "jose" encuentra "José". Se usa al comparar lo que
// el usuario escribe contra los datos en filtros del lado del cliente.
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
