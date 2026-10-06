<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seed user accounts for each RBAC role: Admin, Operator, Member.
     */
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Administrator SMENDA',
                'email'    => 'admin@hydromind.local',
                'password' => Hash::make('admin123'),
                'role'     => 'admin',
            ],
            [
                'name'     => 'Operator Greenhouse',
                'email'    => 'operator@hydromind.local',
                'password' => Hash::make('operator123'),
                'role'     => 'operator',
            ],
            [
                'name'     => 'Member / Siswa',
                'email'    => 'member@hydromind.local',
                'password' => Hash::make('member123'),
                'role'     => 'member',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name'     => $user['name'],
                    'password' => $user['password'],
                    'role'     => $user['role'],
                ]
            );
        }
    }
}
