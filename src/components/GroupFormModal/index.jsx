import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

/**
 * Props:
 * - open: boolean
 * - onClose: fn
 * - onCreate: fn(values)   // recibirá group_name ya resuelto (custom o select)
 * - options: {
 *     edad:     Array<{value,label}>
 *     genero:   Array<{value,label}>
 *     campania: Array<{value,label}>
 *     group_name: Array<{value,label}>  // opciones existentes del back
 *   }
 * - loadingOptions?: boolean
 */

const schema = Yup.object({
  nombre: Yup.string().required("Requerido"),
  edad: Yup.string().required("Selecciona una opción"),
  genero: Yup.string().required("Selecciona una opción"),
  campania: Yup.string().required("Selecciona una opción"),
  // Validación condicional:
  useCustomGroup: Yup.boolean(),
  group_name: Yup.string().when("useCustomGroup", {
    is: false,
    then: (s) => s.required("Selecciona una opción"),
    otherwise: (s) => s.notRequired(),
  }),
  custom_group: Yup.string().when("useCustomGroup", {
    is: true,
    then: (s) => s.trim().required("Requerido"),
    otherwise: (s) => s.notRequired(),
  }),
});

export default function GroupFormModal({
  open,
  onClose,
  onCreate,
  options,
  loadingOptions = false,
}) {
  if (!open) return null;

  const {
    edad = [],
    genero = [],
    campania = [],
    group_name: groupOptions = [],
  } = options || {};

  // Agregamos "Otro…" al final del select de grupos
  const GROUP_WITH_OTHER = [
    ...groupOptions,
    { value: "__OTHER__", label: "Otro…" },
  ];

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
            group_name: "",     // valor del select (cuando no es “Otro…”)
            useCustomGroup: false,
            custom_group: "",   // texto cuando se elige “Otro…”
          }}
          validationSchema={schema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            const payload = {
              ...values,
              // Resolver el nombre final del grupo:
              group_name: values.useCustomGroup
                ? values.custom_group.trim()
                : values.group_name,
            };
            // Limpieza de claves auxiliares:
            delete payload.useCustomGroup;
            delete payload.custom_group;

            onCreate(payload);
            setSubmitting(false);
            resetForm();
            onClose();
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
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

              {/* Select de Group con “Otro…” */}
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Group (routers)</span>
                <Field
                  as="select"
                  name="group_name"
                  disabled={loadingOptions}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                  value={values.useCustomGroup ? "__OTHER__" : values.group_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__OTHER__") {
                      setFieldValue("useCustomGroup", true);
                      setFieldValue("group_name", ""); // limpiar selección previa
                    } else {
                      setFieldValue("useCustomGroup", false);
                      setFieldValue("group_name", val);
                      setFieldValue("custom_group", "");
                    }
                  }}
                >
                  <option value="">Selecciona…</option>
                  {GROUP_WITH_OTHER.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Field>
                {!values.useCustomGroup && (
                  <ErrorMessage name="group_name" component="div" className="text-xs text-red-600" />
                )}
              </label>

              {/* Input visible SOLO si se elige “Otro…” */}
              {values.useCustomGroup && (
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">Nuevo grupo</span>
                  <Field
                    name="custom_group"
                    placeholder="Escribe el nombre del grupo"
                    className="px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="custom_group" component="div" className="text-xs text-red-600" />
                </label>
              )}

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
