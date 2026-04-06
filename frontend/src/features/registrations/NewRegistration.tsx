import RegistrationForm from './RegistrationForm';

export default function NewRegistration() {
  return (
    <div className="pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Nuevo Registro de Inscripción Militar</h1>
        <p className="text-slate-500 mt-1">
          Complete los datos del joven de 17 años. Utilice la consulta de DNI para autocompletar la información personal.
        </p>
      </div>
      
      <RegistrationForm />
    </div>
  );
}
