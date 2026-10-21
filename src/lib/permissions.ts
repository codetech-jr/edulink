/**
 * EduLink — Sistema de Permisos por Rol
 *
 * Jerarquía:
 *   admin       → Director(a). Acceso total. Único que puede crear usuarios
 *                 y modificar la configuración del colegio.
 *   coordinador → Coordinador(a) / Administrador(a) / Secretaria. Acceso
 *                 operativo completo (pagos, alumnado, comunicados, informes)
 *                 sin acceso a configuración ni gestión de usuarios.
 *   docente     → Solo su portal de calificaciones y asistencia.
 *   representante / estudiante → Sus propios portales de lectura.
 */

export const AppRole = {
  Admin: 'admin',
  Coordinador: 'coordinador',
  Docente: 'docente',
  Representante: 'representante',
  Estudiante: 'estudiante',
} as const

export type AppRole = (typeof AppRole)[keyof typeof AppRole]

/**
 * Roles con acceso al panel administrativo (/admin/*).
 * Tanto admin como coordinador comparten el mismo portal,
 * pero con visibilidad distinta en la UI.
 */
export const ADMIN_ROLES = [AppRole.Admin, AppRole.Coordinador] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

/**
 * Roles exclusivos del director — acciones de configuración,
 * gestión de usuarios y operaciones destructivas.
 */
export const DIRECTOR_ONLY_ROLES = [AppRole.Admin] as const

/**
 * Verifica si un rol tiene acceso al panel administrativo.
 */
export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole)
}

/**
 * Verifica si un rol es exclusivo del director.
 */
export function isDirectorOnly(role: string | null | undefined): boolean {
  return DIRECTOR_ONLY_ROLES.includes(role as (typeof DIRECTOR_ONLY_ROLES)[number])
}

/**
 * Mapa de roles a sus rutas de dashboard.
 * Usada en middleware y en auth-actions para la redirección post-login.
 */
export const ROLE_DASHBOARD_MAP: Record<AppRole, string> = {
  [AppRole.Admin]: '/admin',
  [AppRole.Coordinador]: '/admin',
  [AppRole.Docente]: '/docente',
  [AppRole.Representante]: '/representante',
  [AppRole.Estudiante]: '/estudiante',
}

/**
 * Etiquetas legibles para mostrar en la UI.
 */
export const ROLE_LABELS: Record<AppRole, string> = {
  [AppRole.Admin]: 'Director(a)',
  [AppRole.Coordinador]: 'Coordinador(a)',
  [AppRole.Docente]: 'Docente',
  [AppRole.Representante]: 'Representante',
  [AppRole.Estudiante]: 'Estudiante',
}
