import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Smartphone, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('Attempting sign in with:', { email, password: '***' });

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: t('auth.signInFailed'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Sign in successful');
        toast({
          title: t('auth.signInSuccess'),
          description: t('auth.signInSuccessMessage'),
        });
        navigate('/dashboard');
      }
    } catch (catchError) {
      console.error('Unexpected error during sign in:', catchError);
      toast({
        title: t('auth.signInFailed'),
        description: t('errors.tryAgain'),
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    console.log('Attempting sign up with:', { email, fullName, password: '***' });

    try {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: t('auth.signUpFailed'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Sign up successful');
        toast({
          title: t('auth.signUpSuccess'),
          description: t('auth.signUpSuccessMessage'),
        });
      }
    } catch (catchError) {
      console.error('Unexpected error during sign up:', catchError);
      toast({
        title: t('auth.signUpFailed'),
        description: t('errors.tryAgain'),
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')} {t('common.home')}
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">PhoneHub</CardTitle>
            <CardDescription>
              {t('auth.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">{t('auth.email')}</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">{t('auth.password')}</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder={t('auth.passwordPlaceholder')}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">{t('auth.fullName')}</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder={t('auth.fullNamePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder={t('auth.passwordCreatePlaceholder')}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t('auth.creatingAccount') : t('auth.signUp')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;