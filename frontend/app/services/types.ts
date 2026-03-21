//modelos
interface Attributes {
  emprendedor_id: number;
  nombre: string;
  apellido: string;
  documento_identidad: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  domicilio: string;
  localidad: string | null;
  sexo: string;
  mail: string;
  cuit: string;
  medio_de_pago_id: number;
  medio_de_pago_nombre: string;
  situacion_fiscal_id: number;
  situacion_fiscal_nombre: string;
}

interface Emprendedor {
  type: string;
  id: string;
  attributes: Attributes;
}


export interface CustomPaginatedResponse<T> {
  links: { next: string | null; previous: string | null };
  data: T[];
  meta: { count: number };
}