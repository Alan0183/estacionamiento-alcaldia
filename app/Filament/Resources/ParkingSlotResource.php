<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ParkingSlotResource\Pages;
use App\Models\ParkingSlot;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Validation\Rule;

class ParkingSlotResource extends Resource
{
    protected static ?string $model = ParkingSlot::class;

    protected static ?string $navigationIcon  = 'heroicon-o-map-pin';
    protected static ?string $navigationLabel = 'Estacionamiento Calle 10';
    protected static ?string $modelLabel      = 'Cajón';
    protected static ?string $pluralModelLabel= 'Estacionamiento Calle 10';
    protected static ?int    $navigationSort  = 1;

    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->where('piso', 1);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Hidden::make('piso')->default(1),

            Forms\Components\Section::make('Información del Cajón')
                ->schema([
                    Forms\Components\TextInput::make('slot_number')
                        ->label('Número de Cajón')
                        ->required()
                        ->maxLength(10)
                        ->rules(function ($record) {
                            return [
                                'required',
                                Rule::unique('parking_slots', 'slot_number')
                                    ->where('piso', 1)
                                    ->ignore($record?->id),
                            ];
                        }),

                    Forms\Components\Select::make('estado')
                        ->label('Estado')
                        ->options([
                            'libre'     => 'Libre',
                            'ocupado'   => 'Ocupado',
                            'reservado' => 'Reservado',
                        ])
                        ->required()
                        ->default('libre'),
                ])->columns(2),

            Forms\Components\Section::make('Datos del Ocupante')
                ->schema([
                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre del Propietario')
                        ->maxLength(100),

                    Forms\Components\TextInput::make('telefono')
                        ->label('Teléfono del Propietario')
                        ->maxLength(20),

                    Forms\Components\TextInput::make('placa')
                        ->label('Placa')
                        ->maxLength(20),

                    Forms\Components\TextInput::make('modelo')
                        ->label('Modelo del Vehículo')
                        ->maxLength(100),

                    Forms\Components\TextInput::make('notas')
                        ->label('Notas')
                        ->maxLength(200),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('slot_number')
                    ->label('Cajón')
                    ->sortable()
                    ->searchable()
                    ->badge(),

                Tables\Columns\TextColumn::make('nombre')
                    ->label('Nombre')
                    ->searchable()
                    ->default('—'),

                Tables\Columns\TextColumn::make('placa')
                    ->label('Placa')
                    ->searchable()
                    ->copyable()
                    ->default('—'),

                Tables\Columns\TextColumn::make('modelo')
                    ->label('Modelo')
                    ->default('—'),

                Tables\Columns\BadgeColumn::make('estado')
                    ->label('Estado')
                    ->colors([
                        'success' => 'libre',
                        'danger'  => 'ocupado',
                        'warning' => 'reservado',
                    ]),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Actualizado')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado')
                    ->options([
                        'libre'     => 'Libre',
                        'ocupado'   => 'Ocupado',
                        'reservado' => 'Reservado',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListParkingSlots::route('/'),
            'create' => Pages\CreateParkingSlot::route('/create'),
            'edit'   => Pages\EditParkingSlot::route('/{record}/edit'),
        ];
    }
}
