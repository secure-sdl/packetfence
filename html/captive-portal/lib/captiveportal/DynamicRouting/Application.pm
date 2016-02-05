package captiveportal::DynamicRouting::Application;

=head1 NAME

DynamicRouting::Application

=head1 DESCRIPTION

Application definition for Dynamic Routing

=cut

use Moose;

use Template::AutoFilter;
use pf::log;
use Locale::gettext qw(gettext ngettext);
use captiveportal::DynamicRouting::I18N;

has 'session' => (is => 'rw', required => 1);

has 'root_module' => (is => 'rw', isa => "captiveportal::DynamicRouting::RootModule");

has 'root_module_id' => (is => 'rw');

has 'request' => (is => 'ro', required => 1);

has 'hashed_params' => (is => 'rw');

has 'profile' => (is => 'rw', required => 1, isa => "pf::Portal::Profile");

has 'template_output' => (is => 'rw');

sub BUILD {
    my ($self) = @_;
    my $hashed = {};
    my $request = $self->request;
    foreach my $param (keys %{$request->parameters}){
        if($param =~ /^(.+)\[(.+)\]$/){
            $hashed->{$1} //= {};
            $hashed->{$1}->{$2} = $request->parameters->{$param};
        }
        else {
            $hashed->{$param} = $request->parameters->{$param};
        }
    }
    $self->hashed_params($hashed);
};

sub rendering_map {
    my ($self, $previous) = @_;
    use captiveportal::DynamicRouting::RenderingMap;
    my $i18n = captiveportal::DynamicRouting::I18N->new;
    my $form = captiveportal::DynamicRouting::RenderingMap->new(language_handle => $i18n);
    $form->process(params => $previous);
    return $form;
}

sub set_current_module {
    my ($self, $module) = @_;
    $self->session->{current_module_id} = $module;
}

sub current_module_id {
    my ($self) = @_;
    $self->session->{current_module_id} //= $self->root_module->id;
    return $self->session->{current_module_id};
}

sub execute {
    my ($self) = @_;
    $self->root_module->execute();
}

sub render {
    my ($self, $template, $args) = @_;


    my $inner_content = $self->_render($template,$args);

    my $layout_args = {
        flash => $self->flash,
        content => $inner_content,
    };
    my $content = $self->_render('layout.html', $layout_args);

    $self->template_output($content);
   
    $self->empty_flash();
}

sub _render {
    my ($self, $template, $args) = @_;
    
#    get_logger->trace(sub { use Data::Dumper ; "Rendering template $template with args : ".Dumper($args)});
    
    our $TT_OPTIONS = {
        ABSOLUTE => 1, 
        AUTO_FILTER => 'html',
    };

    use Template::Stash;

    # define list method to return new list of odd numbers only
    $args->{ i18n } = sub {
        my $string = shift;
        return $self->i18n($string);
    };

    $args->{rendering_map} = $self->rendering_map(defined($args->{previous_request}) ? $args->{previous_request}->as_hashref : {});

    our $processor = Template::AutoFilter->new($TT_OPTIONS);;
    my $output = '';
    $processor->process("/usr/local/pf/html/captive-portal/new-templates/$template", $args, \$output) || die("Can't generate template $template: ".$processor->error);

    return $output;
}

sub i18n {
    my ( $self, $msgid ) = @_;

    my $msg = gettext($msgid);
    utf8::decode($msg);

    return $msg;
}

sub ni18n {
    my ( $self, $singular, $plural, $category ) = @_;

    my $msg = ngettext( $singular, $plural, $category );
    utf8::decode($msg);

    return $msg;
}

=head2 i18n_format

Pass message id through gettext then sprintf it.

Meant to be called from the TT templates.

=cut

sub i18n_format {
    my ( $self, $msgid, @args ) = @_;
    my $msg = sprintf( gettext($msgid), @args );
    utf8::decode($msg);
    return $msg;
}

sub error {
    my ($self, $message) = @_;
    $self->render("error.html", {message => $message});
}

sub empty_flash {
    my ($self) = @_;
    $self->session->{flash} = {};
}

sub flash {
    my ($self) = @_;
    $self->session->{flash} //= {};
    return $self->session->{flash};
}

=head1 AUTHOR

Inverse inc. <info@inverse.ca>

=head1 COPYRIGHT

Copyright (C) 2005-2016 Inverse inc.

=head1 LICENSE

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
USA.

=cut

__PACKAGE__->meta->make_immutable;

1;

