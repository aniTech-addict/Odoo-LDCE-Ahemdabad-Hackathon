export function UserManagementTable({ users }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-6 py-5">
                <h2 className="font-semibold">
                    User management
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-zinc-500">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-3 py-4">Trips</th>
                            <th className="px-3 py-4">
                                Status
                            </th>
                            <th className="px-6 py-4">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, idx) => (
                            <tr key={idx} className="border-t border-zinc-100 dark:border-zinc-800">
                                <td className="px-6 py-4">
                                    <p className="font-medium">
                                        {u.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {u.email}
                                    </p>
                                </td>
                                <td className="px-3 py-4">
                                    {u.trips}
                                </td>
                                <td className="px-3 py-4">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                                    >
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select className="rounded-md border-0 bg-zinc-50 px-2 py-1 text-xs dark:bg-zinc-800">
                                        <option>Actions</option>
                                        <option>Edit</option>
                                        <option>Suspend</option>
                                        <option>Delete</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
