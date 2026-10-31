export interface BlueTopic {
  title: string;
  text: string;
  target?: string;
  targetLabel?: string;
  focusHint?: string;
}

export interface BlueGuide {
  title: string;
  intro: string;
  topics: BlueTopic[];
}

/** Orientación de interfaz basada en los campos y supuestos existentes; no sustituye una consulta profesional. */
export const BLUE_GUIDES: Record<'salary' | 'thirteenth' | 'vacation' | 'termination', BlueGuide> = {
  salary: {
    title: 'Guía de salario neto',
    intro: 'Te ayudo a identificar los datos que pide esta calculadora.',
    topics: [
      { title: '1. Salario bruto por pago', text: 'Es el importe antes de descuentos que recibes en cada pago. Puedes consultarlo en tu contrato o comprobante.', target: 'gross', targetLabel: 'Ir al salario bruto', focusHint: 'Aquí va el importe antes de descuentos, correspondiente a cada pago.' },
      { title: '2. Frecuencia de pago', text: 'Elige la frecuencia que corresponda al importe escrito. La herramienta usa 24 pagos al año para quincenal y 26 para bisemanal; mensual y semanal son opciones distintas.' },
      { title: '3. Comisiones y deducciones', text: 'En las opciones puedes añadir ingresos variables habituales por pago y deducciones anuales declaradas a tu empleador. La herramienta supone que los ingresos variables se repiten en cada pago.' },
      { title: '4. Cómo leer el resultado', text: 'El neto es una estimación: muestra los descuentos calculados y los supuestos usados para proyectar el ISR. La retención real puede variar con tu planilla y tus ingresos durante el año.' }
    ]
  },
  thirteenth: {
    title: 'Guía del décimo tercer mes',
    intro: 'Primero elige el período que quieres estimar; después escoge cómo aportar tus datos.',
    topics: [
      { title: '1. Partida y año', text: 'Selecciona abril, agosto o diciembre y el año de pago. La calculadora mostrará el período correspondiente.', target: 'period', targetLabel: 'Ir a la partida', focusHint: 'Elige la partida que deseas consultar; el año se indica en el campo siguiente.' },
      { title: '2. Salario fijo o devengado', text: 'Usa «salario fijo» para una estimación con tu salario mensual. Usa «lo devengado» si conoces los salarios y otros ingresos recibidos en ese período.' },
      { title: '3. Fecha e ISR', text: 'En salario fijo, indica la fecha de ingreso si empezaste durante el período. En el modo devengado, el salario habitual es opcional y se usa para estimar el ISR.' },
      { title: '4. Cómo leer el resultado', text: 'La herramienta muestra el bruto y los descuentos estimados. Si no dispone del salario habitual, identifica el importe como neto antes de ISR.' }
    ]
  },
  vacation: {
    title: 'Guía de vacaciones',
    intro: 'Puedes calcular con las fechas trabajadas o con los días pendientes que ya conoces.',
    topics: [
      { title: '1. Último salario mensual', text: 'Escribe tu último salario mensual. Si tienes comisiones o aumentos, la sección de opciones permite indicar el promedio de los últimos 11 meses.', target: 'salary', targetLabel: 'Ir al salario mensual', focusHint: 'Indica tu último salario mensual; el promedio de 11 meses está en las opciones.' },
      { title: '2. Fechas trabajadas', text: 'Elige «Fechas trabajadas» si quieres estimar los días acumulados de un período. Indica desde cuándo hasta cuándo trabajaste y los días ya disfrutados en ese mismo período.' },
      { title: '3. Días pendientes', text: 'Elige «Días pendientes» si ya conoces el saldo de vacaciones que te corresponde. En este modo se usa directamente el saldo indicado.' },
      { title: '4. Cómo leer el resultado', text: 'Verás días y pago bruto. La estimación también muestra un neto antes de ISR; la retención de ISR puede depender de tu ingreso anual.' }
    ]
  },
  termination: {
    title: 'Guía de liquidación',
    intro: 'Reúne los datos de la relación laboral antes de empezar; algunos conceptos requieren revisión adicional.',
    topics: [
      { title: '1. Salario y fechas', text: 'Indica el salario mensual que pide el formulario y las fechas de ingreso y último día de trabajo. Lee la indicación del campo si recibes comisiones o sobretiempo.', target: 'salary', targetLabel: 'Ir al salario mensual', focusHint: 'El formulario explica qué promedio usar si recibes comisiones o sobretiempo.' },
      { title: '2. Contrato y motivo', text: 'Elige el tipo de contrato y el motivo de terminación. Según la selección, pueden aparecer preguntas adicionales; la herramienta no determina por sí sola tu situación legal.', target: 'contract', targetLabel: 'Ir al tipo de contrato', focusHint: 'Selecciona el tipo de contrato; después indica el motivo de terminación.' },
      { title: '3. Datos opcionales', text: 'Puedes indicar vacaciones pendientes, lo devengado desde el último décimo y el promedio de los últimos cinco años. Si no aportas algunos datos, la herramienta explica cuándo usa una estimación.' },
      { title: '4. Cómo leer el resultado', text: 'Revisa el desglose y las advertencias. Si un concepto requiere revisión y no está incluido, el total se identifica como parcial. El neto tampoco incluye todos los conceptos o retenciones posibles.' }
    ]
  }
};
