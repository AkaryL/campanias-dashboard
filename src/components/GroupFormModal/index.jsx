import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

/**
 * Props:
 * - open: boolean
 * - onClose: fn
 * - onCreate: fn(values)
 * - options: {
 *     edad:   Array<{value,label}>
 *     genero: Array<{value,label}>
 *     campania: Array<{value,label}>
 *     group:  Array<{value,label}>
 *   }
 * - loadingOptions?: boolean  // opcional: deshabilita selects mientras cargas del back
 */
const schema = Yup.object({
  nombre: Yup.string().required("Requerido"),
  edad: Yup.string().required("Selecciona una opción"),
  genero: Yup.string().required("Selecciona una opción"),
  campania: Yup.string().required("Selecciona una opción"),
  group_name: Yup.string().required("Selecciona una opción"),
});

export default function GroupFormModal({ open, onClose, onCreate, options, loadingOptions = false }) {
  if (!open) return null;

  const { edad = [], genero = [], campania = [], group_name = [] } = options || {};

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Crear nuevo grupo</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg hover:bg-slate-100">✕</button>
        </div>

        <Formik
          initialValues={{
            nombre: "",
            edad: "",
            genero: "",
            campania: "",
            group_name: "",
          }}
          validationSchema={schema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            onCreate(values);
            setSubmitting(false);
            resetForm();
            onClose();
          }}
        >
          {({ isSubmitting }) => (
            <Form className="p-4 grid grid-cols-1 gap-4">
              <FieldText label="Nombre del grupo" name="nombre" placeholder="Ej: Mujer 50+" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldSelect
                  label="Edad"
                  name="edad"
                  disabled={loadingOptions}
                  options={edad}
                />
                <FieldSelect
                  label="Género"
                  name="genero"
                  disabled={loadingOptions}
                  options={genero}
                />
              </div>

              <FieldSelect
                label="Campaña a mostrar"
                name="campania"
                disabled={loadingOptions}
                options={campania}
              />

              <FieldSelect
                label="Group (routers)"
                name="group_name"
                disabled={loadingOptions}
                options={group_name}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loadingOptions}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Crear
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

function FieldText({ label, name, placeholder }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <Field
        name={name}
        placeholder={placeholder}
        className="px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ErrorMessage name={name} component="div" className="text-xs text-red-600" />
    </label>
  );
}

function FieldSelect({ label, name, options, disabled }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <Field
        as="select"
        name={name}
        disabled={disabled}
        className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
      >
        <option value="">Selecciona…</option>
        {(options || []).map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Field>
      <ErrorMessage name={name} component="div" className="text-xs text-red-600" />
    </label>
  );
}
