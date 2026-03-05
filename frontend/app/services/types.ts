//modelos
export interface Emprendedor {
    id: number;
    nombre: string;
    apellido: string;
    documento_identidad: string;
    fecha_nacimiento: string;
    fecha_alta: Date;
    nacionalidad: string;
    domicilio: string;
    localidad: string;
    sexo: string;
    medio_de_pago: number;
    situacion_fiscal: number;
}
