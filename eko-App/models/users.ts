import AsyncStorage from '@react-native-async-storage/async-storage';

export class User {
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: Date;
    cars: string[];
    goals: string[];
    groups: string[];
    isLoggedIn: boolean = false;

    constructor(id: string, email: string, name: string, password: string, createdAt: Date = new Date(), cars: string[] = [] , goals: string[] = [], groups: string[] = [], isLoggedIn: boolean = false) {
        if (!id || !email || !name || !password) {
            throw new Error('ID, email, nome e password são obrigatórios');
        }
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.createdAt = createdAt;
        this.cars = cars;
        this.goals = goals;
        this.groups = groups;
        this.isLoggedIn = isLoggedIn;
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            password: this.password,
            createdAt: this.createdAt.toISOString(),
            cars: this.cars,
            goals: this.goals,
            groups: this.groups,
            isLoggedIn: this.isLoggedIn
        };
    }

    static fromJSON(json: any): User {
        if (!json) {
            throw new Error('JSON inválido');
        }
        return new User(
            json.id,
            json.email,
            json.name,
            json.password,
            new Date(json.createdAt),
            json.cars || [],
            json.goals || [],
            json.groups || [],
            json.isLoggedIn || false
        );
    }

    // Method to verify password
    verifyPassword(password: string): boolean {
        return this.password === password;
    }

    // Method to update password
    updatePassword(newPassword: string): void {
        if (newPassword.length < 6) {
            throw new Error('A password deve ter pelo menos 6 caracteres');
        }
        this.password = newPassword;
    }
}

const STORAGE_KEY = 'users';
const SESSION_KEY = 'currentUser';

export async function initializeDefaultUsers(): Promise<void> {
    const users = await getAllUsers();
    
    const hasDefaultUsers = users.some(u => u.id === '1' || u.id === '2' || u.id === '3');
    if (hasDefaultUsers) {
        return;
    }

    const defaultUsers = [
        new User(
            '1',
            'maria.silva@email.pt',
            'Maria Silva',
            'password123',
            new Date('2024-01-15'),
            [],
            [],
            [],
            false
        ),
        new User(
            '2',
            'joao.santos@email.pt',
            'João Santos',
            'password123',
            new Date('2024-02-10'),
            [],
            [],
            [],
            false
        ),
        new User(
            '3',
            'ana.costa@email.pt',
            'Ana Costa',
            'password123',
            new Date('2024-03-05'),
            [],
            [],
            [],
            false
        )
    ];

    for (const user of defaultUsers) {
        await saveUser(user);
    }
}

export async function saveUser(user: User): Promise<void> {
    if (!user) {
        throw new Error('Utilizador inválido');
    }
    try {
        const users = await getAllUsers();
        const index = users.findIndex(u => u.id === user.id);
        
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users.map(u => u.toJSON())));
    } catch (error) {
        throw new Error(`Erro ao guardar utilizador: ${error}`);
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data).map((json: any) => User.fromJSON(json));
    } catch (error) {
        throw new Error(`Erro ao obter utilizadores: ${error}`);
    }
}

export async function getUserById(id: string): Promise<User | undefined> {
    if (!id) {
        throw new Error('ID é obrigatório');
    }
    const users = await getAllUsers();
    return users.find(u => u.id === id);
}

export async function deleteUser(id: string): Promise<void> {
    if (!id) {
        throw new Error('ID é obrigatório');
    }
    try {
        const users = await getAllUsers();
        const filteredUsers = users.filter(u => u.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers.map(u => u.toJSON())));
        
        const currentUser = await getLoggedInUser();
        if (currentUser && currentUser.id === id) {
            await AsyncStorage.removeItem(SESSION_KEY);
        }
    } catch (error) {
        throw new Error(`Erro ao eliminar utilizador: ${error}`);
    }
}

export async function updateUser(userId: string, updates: Partial<Pick<User, 'email' | 'name' | 'password'>>): Promise<void> {
    if (!userId) {
        throw new Error('ID é obrigatório');
    }
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    
    if (updates.email) {
        // Check if email is already in use by another user
        const users = await getAllUsers();
        const existingUser = users.find(u => u.email.toLowerCase() === updates.email!.toLowerCase() && u.id !== userId);
        if (existingUser) {
            throw new Error('Este email já está a ser utilizado');
        }
        user.email = updates.email;
    }
    if (updates.name) user.name = updates.name;
    if (updates.password) user.password = updates.password;
    
    await saveUser(user);
    
    // Update session if this is the logged-in user
    const currentUser = await getLoggedInUser();
    if (currentUser && currentUser.id === userId) {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user.toJSON()));
    }
}

export async function loginUser(id: string): Promise<void> {
    if (!id) {
        throw new Error('ID é obrigatório');
    }
    const user = await getUserById(id);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    
    user.isLoggedIn = true;
    await saveUser(user);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user.toJSON()));
}

export async function authenticateUser(email: string, password: string): Promise<User> {
    if (!email.trim() || !password.trim()) {
        throw new Error('Por favor, preencha todos os campos');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Por favor, insira um email válido');
    }

    const users = await getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        throw new Error('Utilizador não encontrado. Verifique o email ou registe-se.');
    }

    if (!user.verifyPassword(password)) {
        throw new Error('Password incorreta');
    }

    return user;
}

export async function logoutUser(id: string): Promise<void> {
    if (!id) {
        throw new Error('ID é obrigatório');
    }
    const user = await getUserById(id);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    
    user.isLoggedIn = false;
    await saveUser(user);
    await AsyncStorage.removeItem(SESSION_KEY);
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
    if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error('Por favor, preencha todos os campos');
    }

    if (name.trim().length < 3) {
        throw new Error('O nome deve ter pelo menos 3 caracteres');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Por favor, insira um email válido');
    }

    if (password.length < 6) {
        throw new Error('A password deve ter pelo menos 6 caracteres');
    }

    const users = await getAllUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        throw new Error('Este email já está registado');
    }

    let newId = 1;
    if (users.length > 0) {
        const maxId = Math.max(...users.map(u => {
            const id = parseInt(u.id);
            return isNaN(id) ? 0 : id;
        }));
        newId = maxId + 1;
    }

    const newUser = new User(
        newId.toString(),
        email,
        name,
        password,
        new Date(),
        [],
        [],
        [],
        false
    );

    await saveUser(newUser);
    return newUser;
}

export async function getLoggedInUser(): Promise<User | null> {
    try {
        const data = await AsyncStorage.getItem(SESSION_KEY);
        if (!data) return null;
        return User.fromJSON(JSON.parse(data));
    } catch (error) {
        console.error('Erro ao obter utilizador da sessão:', error);
        return null;
    }
}

export async function isUserLoggedIn(): Promise<boolean> {
    const user = await getLoggedInUser();
    return user !== null && user.isLoggedIn;
}

export async function addGroupToUser(userId: string, groupId: string): Promise<void> {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    if (!user.groups.includes(groupId)) {
        user.groups.push(groupId);
        await saveUser(user);
        
        const currentUser = await getLoggedInUser();
        if (currentUser && currentUser.id === userId) {
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user.toJSON()));
        }
    }
}

export async function removeGroupFromUser(userId: string, groupId: string): Promise<void> {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    user.groups = user.groups.filter(id => id !== groupId);
    await saveUser(user);
    
    const currentUser = await getLoggedInUser();
    if (currentUser && currentUser.id === userId) {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user.toJSON()));
    }
}

export async function addGoalToUser(userId: string, goalId: string): Promise<void> {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    if (!user.goals.includes(goalId)) {
        user.goals.push(goalId);
        await saveUser(user);
        
        const currentUser = await getLoggedInUser();
        if (currentUser && currentUser.id === userId) {
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user.toJSON()));
        }
    }
}

export async function removeGoalFromUser(userId: string, goalId: string): Promise<void> {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('Utilizador não encontrado');
    }
    user.goals = user.goals.filter(id => id !== goalId);
    await saveUser(user);
    
    const currentUser = await getLoggedInUser();
    if (currentUser && currentUser.id === userId) {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user.toJSON()));
    }
}