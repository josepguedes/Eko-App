import AsyncStorage from '@react-native-async-storage/async-storage';

export class Group {
    id: string;
    name: string;
    description: string;
    bannerImage: string | null;
    maxUsers: number;
    members: string[];
    createdBy: string;
    createdAt: Date;

    constructor(
        id: string,
        name: string,
        description: string,
        createdBy: string,
        bannerImage: string | null = null,
        maxUsers: number = 50,
        members: string[] = [],
        createdAt: Date = new Date()
    ) {
        if (!id || !name || !createdBy) {
            throw new Error('ID, name and creator are required');
        }
        this.id = id;
        this.name = name;
        this.description = description;
        this.bannerImage = bannerImage;
        this.maxUsers = maxUsers;
        this.members = members;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            bannerImage: this.bannerImage,
            maxUsers: this.maxUsers,
            members: this.members,
            createdBy: this.createdBy,
            createdAt: this.createdAt.toISOString(),
        };
    }

    static fromJSON(json: any): Group {
        if (!json) {
            throw new Error('Invalid JSON');
        }
        return new Group(
            json.id,
            json.name,
            json.description,
            json.createdBy,
            json.bannerImage || null,
            json.maxUsers || 50,
            json.members || [],
            new Date(json.createdAt)
        );
    }
}

const STORAGE_KEY = 'groups';
const DEFAULT_BANNER = 'default';

// Função para forçar reset dos grupos (útil para debug)
export async function resetGroups(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Grupos removidos do storage');
}

// Inicializar grupos pré-definidos com utilizadores distribuídos
export async function initializeDefaultGroups(): Promise<void> {
    const groups = await getAllGroups();

    // Se já existem grupos, não inicializar novamente
    if (groups.length > 0) {
        console.log('Grupos já existem:', groups.length);
        return;
    }

    console.log('A criar grupos pré-definidos...');

    const defaultGroups = [
        new Group(
            '1',
            "Eco Warriors Portugal",
            'Comunidade portuguesa dedicada a condução ecológica. Partilha dicas, desafios e conquistas para um futuro mais verde!',
            '1',
            'group1.jpg',
            50,
            ['1', '2', '3'],
            new Date('2024-01-01')
        ),
        new Group(
            '2',
            'Green Road Heroes',
            'Heróis da estrada verde. Conduzimos de forma inteligente, limpa e eficiente. Junta-te a nós na missão de reduzir a pegada de carbono!',
            '2',
            'group2.jpg',
            40,
            ['1', '2'],
            new Date('2024-01-15')
        ),
        new Group(
            '3',
            'Save Money, Save Planet',
            'Poupa dinheiro enquanto salvas o planeta! Aprende técnicas de eco-condução que reduzem consumo de combustível e emissões.',
            '3',
            'group3.jpg',
            60,
            ['2', '3'],
            new Date('2024-02-01')
        ),
        new Group(
            '4',
            'EcoDrive Champions',
            'Os campeões da condução ecológica. Competições amigáveis, rankings e recompensas por hábitos sustentáveis ao volante.',
            '1',
            'group4.jpg',
            100,
            ['1', '3'],
            new Date('2024-02-15')
        ),
        new Group(
            '5',
            'Sustainable Commuters',
            'Grupo para quem faz trajetos diários de forma sustentável. Partilha rotas eficientes e dicas para o dia a dia.',
            '2',
            'group5.jpg',
            75,
            ['1', '2', '3'],
            new Date('2024-03-01')
        ),
        new Group(
            '6',
            'Clean Energy Drivers',
            'Dedicados à energia limpa e transporte sustentável. Discussões sobre veículos elétricos, híbridos e futuro da mobilidade.',
            '3',
            'group6.jpg',
            50,
            ['2', '3'],
            new Date('2024-03-15')
        ),
    ];

    // Guardar diretamente no storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGroups.map(g => g.toJSON())));

    // Verificar se foram guardados
    const savedGroups = await getAllGroups();
    // console.log('6 grupos pré-definidos criados!');
    // console.log('Grupos guardados:', savedGroups.length);
    // console.log('Nomes dos grupos:', savedGroups.map(g => g.name));
}

export async function saveGroup(group: Group): Promise<void> {
    if (!group) {
        throw new Error('Invalid group');
    }
    try {
        const groups = await getAllGroups();
        const index = groups.findIndex(g => g.id === group.id);

        if (index >= 0) {
            groups[index] = group;
        } else {
            groups.push(group);
        }

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups.map(g => g.toJSON())));
    } catch (error) {
        throw new Error(`Failed to save group: ${error}`);
    }
}

export async function getAllGroups(): Promise<Group[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data).map((json: any) => Group.fromJSON(json));
    } catch (error) {
        throw new Error(`Failed to get groups: ${error}`);
    }
}

export async function getGroupById(id: string): Promise<Group | undefined> {
    if (!id) {
        throw new Error('ID is required');
    }
    const groups = await getAllGroups();
    return groups.find(g => g.id === id);
}

export async function createGroup(
    name: string,
    description: string,
    createdBy: string,
    bannerImage: string | null = null,
    maxUsers: number = 50
): Promise<Group> {
    if (!name.trim()) {
        throw new Error('Group name is required');
    }
    if (!description.trim()) {
        throw new Error('Group description is required');
    }
    if (name.length < 3) {
        throw new Error('Name must have at least 3 characters');
    }
    if (maxUsers < 2) {
        throw new Error('You must have at least 2 members minimum');
    }

    const groups = await getAllGroups();
    let newId = 1;
    if (groups.length > 0) {
        const maxId = Math.max(...groups.map(g => parseInt(g.id) || 0));
        newId = maxId + 1;
    }

    const finalBannerImage = bannerImage || DEFAULT_BANNER;

    const newGroup = new Group(
        newId.toString(),
        name,
        description,
        createdBy,
        finalBannerImage,
        maxUsers,
        [createdBy],
        new Date()
    );

    await saveGroup(newGroup);
    // console.log('Grupo criado:', newGroup);
    return newGroup;
}

export async function joinGroup(groupId: string, userId: string): Promise<void> {
    const group = await getGroupById(groupId);
    if (!group) {
        throw new Error('Group not found');
    }
    if (group.members.includes(userId)) {
        throw new Error('You are already a member of this group');
    }
    if (group.members.length >= group.maxUsers) {
        throw new Error('Group is full');
    }

    group.members.push(userId);
    await saveGroup(group);
}

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
    const group = await getGroupById(groupId);
    if (!group) {
        throw new Error('Group not found');
    }
    if (!group.members.includes(userId)) {
        throw new Error('You are not a member of this group');
    }
    if (group.createdBy === userId) {
        throw new Error('The creator cannot leave the group');
    }

    group.members = group.members.filter(id => id !== userId);
    await saveGroup(group);
}

export async function getUserGroups(userId: string): Promise<Group[]> {
    const groups = await getAllGroups();
    return groups.filter(g => g.members.includes(userId));
}

export async function getSuggestedGroups(userId: string): Promise<Group[]> {
    const groups = await getAllGroups();
    return groups.filter(g =>
        !g.members.includes(userId) &&
        g.members.length < g.maxUsers
    );
}

export async function deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await getGroupById(groupId);
    if (!group) {
        throw new Error('Group not found');
    }
    if (group.createdBy !== userId && group.createdBy !== 'system') {
        throw new Error('Only the creator can delete the group');
    }

    const groups = await getAllGroups();
    const filteredGroups = groups.filter(g => g.id !== groupId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredGroups.map(g => g.toJSON())));
}


export async function deleteUserGroup(groupId: string, userId: string): Promise<void> {
    const group = await getGroupById(groupId);
    if (!group) {
        throw new Error('Group not found');
    }
    if (!group.members.includes(userId)) {
        // console.log(userId);
        throw new Error('You are not a member of this group');
    }
    if (group.createdBy === userId) {
        throw new Error('The creator cannot leave the group');
    }

    group.members = group.members.filter(id => id !== userId);
    await saveGroup(group);
}