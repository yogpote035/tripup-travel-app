import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { createAdmin, fetchAdmins, updateAdminStatus } from "../../../AllStatesFeatures/Admin/AdminSlice";
import { ConfirmDialog, DataToolbar, EmptyState, Pagination, Skeleton } from "./AdminShared";

const initialForm = { name: "", email: "", phone: "", password: "" };

export default function AdminAdministrators() {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.admin.admins);
  const [filters, setFilters] = useState({ page: 1, limit: 10, order: "desc", status: "" });
  const [target, setTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchAdmins(filters)); }, [dispatch, filters]);
  const update = (next) => setFilters((current) => ({ ...current, ...next }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    const result = await dispatch(createAdmin(form)); setSaving(false);
    if (createAdmin.fulfilled.match(result)) { toast.success("Administrator created"); setForm(initialForm); setShowForm(false); }
    else toast.error(result.error?.message || "Unable to create administrator");
  };
  const confirmStatus = async () => {
    const result = await dispatch(updateAdminStatus({ id: target._id, isActive: !target.isActive }));
    if (updateAdminStatus.rejected.match(result)) toast.error(result.error?.message || "Unable to update administrator");
    setTarget(null);
  };

  return <><div className="admin-page-heading"><div><p>Secure access</p><h1>Administrators</h1></div><button className="admin-primary" onClick={() => setShowForm(true)}>Create administrator</button></div>{showForm && <section className="admin-create-card"><form onSubmit={submit}><label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Phone<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label><label>Temporary password<input required minLength="8" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><div><button type="button" className="admin-secondary" onClick={() => setShowForm(false)}>Cancel</button><button disabled={saving} className="admin-primary">{saving ? "Creating…" : "Create administrator"}</button></div></form></section>}<DataToolbar filters={filters} onChange={update} /><section className="admin-table-card">{state.loading ? <Skeleton /> : state.items.length ? <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Created</th><th>Status</th><th /></tr></thead><tbody>{state.items.map((admin) => <tr key={admin._id}><td><b>{admin.name}</b></td><td>{admin.email}</td><td>{admin.phone}</td><td>{new Date(admin.createdAt).toLocaleDateString()}</td><td><span className={`admin-status ${admin.isActive ? "active" : "inactive"}`}>{admin.isActive ? "Active" : "Inactive"}</span></td><td><button className="admin-secondary" onClick={() => setTarget(admin)}>{admin.isActive ? "Deactivate" : "Activate"}</button></td></tr>)}</tbody></table> : <EmptyState title="No administrators found" />}</section><Pagination pagination={state.pagination} onPage={(page) => update({ page })} /><ConfirmDialog open={!!target} title={`${target?.isActive ? "Deactivate" : "Activate"} administrator`} message={target?.isActive ? `Deactivate ${target?.name}? They will be signed out from all sessions.` : `Activate ${target?.name}? They will be able to sign in again.`} confirmText={target?.isActive ? "Deactivate" : "Activate"} onConfirm={confirmStatus} onCancel={() => setTarget(null)} /></>;
}
