"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Badge from "../ui/badge/Badge";
import toast from "react-hot-toast";
import {
listUsersByRole,
deleteUser,
} from "@/services/userService";
import { User } from "@/types/user";
import { Edit2, Trash2 } from "lucide-react";


export default function UsersPage() {
const params = useParams();
const role = Array.isArray(params.role) ? params.role[0] : params.role;

const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 👉 Fetch users
    const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
    const response = await listUsersByRole(role ?? "");
    setUsers(response.data || []); // backend returns {data: [...]}
    } catch (err) {
    console.error(err);
    setError("Failed to fetch users");
    } finally {
    setLoading(false);
    }
    };

    useEffect(() => {
    fetchUsers();
    }, [role]);

    // 👉 Delete user
    const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
    await deleteUser(userId);
    toast.success("User deleted successfully");
    fetchUsers();
    } catch (err) {
    console.error(err);
    toast.error("Failed to delete user");
    }
    };

    // 👉 Edit user
    const handleEdit = (userId: string) => {
    window.location.href = `/users/update/${userId}`;
    };

    return (
    <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                {role?.replace("-", " ") || "Users"}
            </h1>
            <button onClick={()=> (window.location.href = `/users/create/${role}`)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                Create User
            </button>
        </div>

        {/* Loading & Error */}
        {loading && <p className="text-gray-600 dark:text-gray-300">Loading users...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* No users */}
        {!loading && users.length === 0 && (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
                No {role?.replace("-", " ")} found.
            </p>
        </div>
        )}

        {/* Users Table */}
        {!loading && users.length > 0 && (
        <div
            className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] shadow-sm">
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[900px]">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-white/[0.05] text-left">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-5 py-3 text-gray-500 font-medium text-sm">User</th>
                                <th className="px-5 py-3 text-gray-500 font-medium text-sm">Email</th>
                                <th className="px-5 py-3 text-gray-500 font-medium text-sm">Mobile</th>
                                <th className="px-5 py-3 text-gray-500 font-medium text-sm">City</th>
                                <th className="px-5 py-3 text-gray-500 font-medium text-sm">Role</th>
                                <th className="px-5 py-3 text-gray-500 font-medium text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                            {user.image ? (
                                            <Image src={user.image} width={40} height={40} alt={user.username} />
                                            ) : (
                                            <span className="text-gray-500 dark:text-gray-400">{user.username[0]}</span>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-800 dark:text-white/90 text-sm">
                                            {user.username}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">{user.email}</td>
                                <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">{user.mobile_no}</td>
                                <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-sm">{user.city}</td>
                                <td className="px-5 py-4 text-sm">
                                    <Badge size="sm" color={user.role.toLowerCase().includes("manager") ? "warning"
                                        : "success" }>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="px-5 py-4 text-sm flex gap-2">
                                    {/* Edit Button */}
                                    <button onClick={()=> handleEdit(user.id!)}
                                        className="flex items-center gap-1 py-1 text-blue-600 rounded hover:text-blue-900"
                                        title="Edit User"
                                        >
                                        <Edit2 size={16} />
                                    </button>

                                    {/* Delete Button */}
                                    <button onClick={()=> handleDelete(user.id!)}
                                        className="flex items-center gap-1 py-1 text-red-600 rounded hover:text-red-900"
                                        title="Delete User"
                                        >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        )}
    </div>
    );
    }
