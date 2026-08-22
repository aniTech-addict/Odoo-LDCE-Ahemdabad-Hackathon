export function FormInputField({
    label,
    value,
    setValue,
    fieldKey,
    type = 'text',
    placeholder,
    errors = {},
    setErrors,
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor={fieldKey}>
                {label}
            </label>
            <input
                id={fieldKey}
                type={type}
                value={value}
                onChange={e => {
                    setValue(e.target.value)
                    if (setErrors) {
                        setErrors(x => ({ ...x, [fieldKey]: undefined }))
                    }
                }}
                placeholder={placeholder || label}
                className={`w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-400/40 ${errors[fieldKey] ? 'border-rose-500' : 'border-zinc-300 dark:border-zinc-700'}`}
            />
            {errors[fieldKey] && (
                <p className="text-xs text-rose-500">{errors[fieldKey]}</p>
            )}
        </div>
    )
}
