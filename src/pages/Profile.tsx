import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Settings, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Layout } from '@/components/layout/Layout';
import { CONDITIONS, CONDITION_COLORS, FACULTIES } from '@/types/enums';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getSellerAnnouncements, updateProfile, deleteAccount } from '@/api/sellers';
import { markAsSold, deleteAnnouncement, reserveAnnouncement } from '@/api/announcements';
import { Announcement, Faculty } from '@/types';
import { getImageUrl } from '@/utils/imageUrl';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'listings';
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  
  const [myItems, setMyItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    faculty: '' as Faculty,
  });

  const currentUser = user ? {
    name: user.attributes.name,
    avatar: undefined,
  } : undefined;

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.attributes.name,
        phone: user.attributes.phone,
        faculty: user.attributes.faculty,
      });
      
      // Fetch user's announcements
      const fetchAnnouncements = async () => {
        try {
          const data = await getSellerAnnouncements(parseInt(user.id));
          setMyItems(data);
        } catch (error) {
          console.error('Error fetching announcements:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAnnouncements();
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <Layout isLoggedIn={false}>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Debes iniciar sesión</h1>
          <Button asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleMarkAsSold = async (itemId: string) => {
    try {
      await markAsSold(parseInt(itemId));
      setMyItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, attributes: { ...item.attributes, status: 'sold' as const } } 
          : item
      ));
      toast.success('Artículo marcado como vendido');
    } catch (error) {
      toast.error('Error al marcar como vendido');
    }
  };

  const handleReserve = async (itemId: string) => {
    try {
      await reserveAnnouncement(parseInt(itemId));
      setMyItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, attributes: { ...item.attributes, status: 'reserved' as const } } 
          : item
      ));
      toast.success('Artículo marcado como reservado');
    } catch (error) {
      toast.error('Error al reservar');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteAnnouncement(parseInt(itemId));
      setMyItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Anuncio eliminado');
    } catch (error) {
      toast.error('Error al eliminar el anuncio');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        seller: {
          name: profileData.name,
          phone: profileData.phone,
          faculty: profileData.faculty,
        }
      });
      await refreshUser();
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      await logout(false); // Don't show logout toast
      toast.success('Cuenta eliminada exitosamente');
      navigate('/');
    } catch (error) {
      toast.error('Error al eliminar la cuenta');
    }
  };

  const activeItems = myItems.filter(i => i.attributes.status === 'active');
  const reservedItems = myItems.filter(i => i.attributes.status === 'reserved');
  const soldItems = myItems.filter(i => i.attributes.status === 'sold');

  return (
    <Layout isLoggedIn={isAuthenticated} user={currentUser}>
      <div className="container py-6 max-w-4xl">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20 border-4 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {user.attributes.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{user.attributes.name}</h1>
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground">{user.attributes.email}</p>
            <Badge variant="secondary" className="mt-2">{user.attributes.faculty}</Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="w-full justify-start bg-secondary/50 p-1">
            <TabsTrigger value="listings" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Mis Anuncios</span>
              <span className="sm:hidden">Anuncios</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Editar Perfil</span>
              <span className="sm:hidden">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span>Ajustes</span>
            </TabsTrigger>
          </TabsList>

          {/* My Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{activeItems.length}</p>
                  <p className="text-sm text-muted-foreground">Activos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-warning">{reservedItems.length}</p>
                  <p className="text-sm text-muted-foreground">Reservados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-success">{soldItems.length}</p>
                  <p className="text-sm text-muted-foreground">Vendidos</p>
                </CardContent>
              </Card>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {myItems.length > 0 ? (
                myItems.map(item => {
                  const price = typeof item.attributes.price === 'string' 
                    ? parseFloat(item.attributes.price) 
                    : item.attributes.price;
                  return (
                  <Card key={item.id} className={cn(item.attributes.status === 'sold' && 'opacity-60')}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Link to={`/product/${item.id}`} className="flex-shrink-0">
                          <img 
                            src={getImageUrl(item.attributes.images?.[0])} 
                            alt={item.attributes.title}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <Link 
                              to={`/product/${item.id}`}
                              className="font-semibold hover:text-primary transition-colors truncate"
                            >
                              {item.attributes.title}
                            </Link>
                            <Badge 
                              variant={item.attributes.status === 'active' ? 'default' : 'secondary'}
                              className={cn(
                                item.attributes.status === 'reserved' && 'bg-warning text-warning-foreground',
                                item.attributes.status === 'sold' && 'bg-success text-success-foreground'
                              )}
                            >
                              {item.attributes.status === 'active' && 'Activo'}
                              {item.attributes.status === 'reserved' && 'Reservado'}
                              {item.attributes.status === 'sold' && 'Vendido'}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-primary mb-2">${price.toFixed(2)}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {item.attributes.views_count}
                            </span>
                            <Badge variant="outline" className={cn("text-xs border", CONDITION_COLORS[item.attributes.condition])}>
                              {CONDITIONS[item.attributes.condition]}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {/* Editar - solo si no está vendido */}
                          {item.attributes.status !== 'sold' && (
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/edit/${item.id}`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Link>
                            </Button>
                          )}
                          
                          {/* Reservar - solo si está activo */}
                          {item.attributes.status === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReserve(item.id)}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Reservar
                            </Button>
                          )}
                          
                          {/* Vendido - si no está vendido */}
                          {item.attributes.status !== 'sold' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMarkAsSold(item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Vendido
                            </Button>
                          )}
                          
                          {/* Eliminar - siempre */}
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar anuncio?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. El anuncio será eliminado permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )})
              ) : (
                <div className="text-center py-16 bg-secondary/50 rounded-xl">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No tienes anuncios publicados</p>
                  <Button asChild>
                    <Link to="/publish">Publicar Anuncio</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información de perfil visible para otros usuarios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={user.attributes.email}
                        disabled
                        className="bg-secondary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El correo no se puede cambiar por seguridad.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="0991234567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty">Facultad</Label>
                    <Select 
                      value={profileData.faculty}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, faculty: value as any }))}
                    >
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="Selecciona tu facultad" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {FACULTIES.map(faculty => (
                          <SelectItem key={faculty} value={faculty}>
                            {faculty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full sm:w-auto">
                    Guardar Cambios
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Zona de Peligro
                </CardTitle>
                <CardDescription>
                  Acciones irreversibles relacionadas con tu cuenta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Cuenta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará permanentemente tu cuenta y todos tus anuncios. 
                        No podrás recuperar esta información.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sí, eliminar mi cuenta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
