import {describe,it,expect} from 'vitest';
import {filtrarPublicadas,respuestas,respuestasPublicadas} from './responde';

describe('contenido editorial Responde',()=>{
 it('mantiene identificadores y slugs únicos y contenido verificable',()=>{
  expect(new Set(respuestas.map(x=>x.id)).size).toBe(respuestas.length);
  expect(new Set(respuestas.map(x=>x.slug)).size).toBe(respuestas.length);
  for(const article of respuestasPublicadas){
   expect(article.fuentes.length).toBeGreaterThan(0);
   expect(article.fuentes.every(x=>x.url.startsWith('https://'))).toBe(true);
   expect(article.calculadora.path.startsWith('/')).toBe(true);
   expect(article.revisado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
 });
 it('no incluye borradores ni pendientes entre publicaciones',()=>{
  expect(respuestasPublicadas.every(x=>x.estado==='publicado')).toBe(true);
  const sample=respuestas[0]!;
  expect(filtrarPublicadas([{...sample,estado:'borrador'},{...sample,estado:'pendiente_revision'},sample])).toEqual([sample]);
 });
});
