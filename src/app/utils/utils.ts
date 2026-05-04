/**
 * Clase con funciones útiles para utilizar
 */

import { AbstractControl } from '@angular/forms';

/**
 * Validador para la confirmación de contraseña
 * @param control 
 */
export const confirmPassword = (control: AbstractControl) => {

  if (control.value == control.root.value['password']) {
    return null;
  } else {
    return { confirmed: false };
  }
};

/**
 * Método que recibe el error y genera una respuesta
 * @param error 
 */
export const codeErrors = (error) => {
  let message: string;
  switch (error.status) {
    case 401:
      message = 'Usuario o contraseña incorrectos';
      break;
    case 422:
      message = 'El usuario ya se encuentra registrado';
      break;
    case 423:
      message = 'Esta cuenta se encuentra temporalmente bloqueada, consulte con los administradores para más informacion.';
    break;
    case 404:
    case 500:
      message = 'Error del servidor, inténtelo más tarde';
      break;
    default:
      message = 'Error desconocido, inténtelo más tarde';
      break;
  }
  return message;
}