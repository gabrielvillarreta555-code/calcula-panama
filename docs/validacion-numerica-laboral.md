# Validación numérica laboral

Cada campo numérico de las calculadoras laborales debe ser finito y no superar 10.000.000 en valor absoluto. Es un **límite técnico por campo**, no un tope salarial, una norma ni asesoría. Los controles particulares de cero, negativos, años y fechas siguen aplicándose. Se rechaza el dato inválido con un mensaje y se oculta cualquier resultado anterior para evitar compartir cifras obsoletas.

La validación está en el lector de formularios y en las entradas públicas de los cálculos de salario, décimo, vacaciones y liquidación. No cambia tarifas, parámetros, operaciones ni redondeos legales. El límite se eligió para evitar desbordamientos y mantener los cálculos intermedios dentro de rangos manejables; cualquier cambio futuro requiere análisis de rangos y pruebas.

No se declara aprobación jurídica. Las observaciones sobre liquidación, período probatorio, fueros y vigencia de fuentes siguen pendientes de revisión profesional. No promover la calculadora de liquidación hasta completar esa revisión.
