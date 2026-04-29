// @ts-nocheck
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '@/components/ui';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simuler l'envoi
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="animate-fade-in">
        <Card className="text-center p-8">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 text-success">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
          <p className="text-gray-500 mb-8">
            Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>
          <Link to="/login">
            <Button variant="primary" className="w-full">Retour à la connexion</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card padding="lg">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h1>
          <p className="text-gray-500">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Adresse Email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-5 h-5" />}
            required
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            size="lg"
          >
            Envoyer le lien
          </Button>
        </form>
      </Card>
    </div>
  );
}
